import { useEffect, useMemo, useState } from "react";
import { HuntForm } from "./components/HuntForm";
import { StopCard } from "./components/StopCard";
import { CITY_PACKS, findCityPackById } from "./data";
import { loadSales } from "./lib/adapter";
import { licensedFeedAdapter } from "./lib/adapter/licensed";
import { geocodeAddress } from "./lib/geocode";
import { loadPrefs, savePrefs } from "./lib/prefs";
import { fetchOsrmMatrix } from "./lib/osrm";
import { planRoute } from "./lib/route";
import { formatRouteText, parseShare, shareUrl, shopperUrl } from "./lib/share";
import { clockToHhmm, formatDateRange, minutesToClock, parseClock } from "./lib/hours";
import {
  activeRouteDate,
  clockInZone,
  effectiveDepartAt,
  liveWarnings,
  primaryWarning,
  remainingSummary,
} from "./lib/live";
import { saturdayOf, sundayOf, thisWeekend } from "./lib/weekend";
import type { CategoryId, HuntQuery, LatLng, RoutePlan, Sale } from "./types";

const DEMO_START = CITY_PACKS[0].defaultStart;
const weekend = thisWeekend();
const saved = loadPrefs();
const shared =
  typeof window === "undefined" ? {} : parseShare(window.location.search, window.location.hash);
const hostList = Boolean(shared.host || shared.list);

export default function App() {
  const [address, setAddress] = useState(shared.address ?? saved.address ?? DEMO_START.label);
  const [city, setCity] = useState(shared.city ?? saved.city ?? "Salem");
  const [zip, setZip] = useState(shared.zip ?? saved.zip ?? "97306");
  const [windowStart, setWindowStart] = useState(shared.windowStart ?? weekend.start);
  const [windowEnd, setWindowEnd] = useState(shared.windowEnd ?? weekend.end);
  const [categories, setCategories] = useState<CategoryId[]>(
    shared.categories ?? saved.categories ?? [],
  );
  const [halfDay, setHalfDay] = useState(shared.halfDay ?? saved.halfDay ?? false);
  const [departAt, setDepartAt] = useState(shared.departAt ?? saved.departAt ?? "09:00");
  const [pasted, setPasted] = useState(shared.list ?? saved.pasted ?? "");
  const [feedUrl, setFeedUrl] = useState(shared.feedUrl ?? saved.feedUrl ?? "");
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [shopperStatus, setShopperStatus] = useState("");
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [feedNote, setFeedNote] = useState("");
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [here, setHere] = useState<(LatLng & { label: string }) | null>(null);
  const [salesCache, setSalesCache] = useState<Sale[]>([]);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [markingDone, setMarkingDone] = useState(false);

  const queryBase = useMemo(
    () => ({
      city,
      zip,
      windowStart,
      windowEnd,
      categories,
      halfDay,
      departAt,
      excludeIds,
      feedUrl,
    }),
    [city, zip, windowStart, windowEnd, categories, halfDay, departAt, excludeIds, feedUrl],
  );

  useEffect(() => {
    savePrefs({ address, city, zip, categories, halfDay, departAt, pasted, feedUrl });
  }, [address, city, zip, categories, halfDay, departAt, pasted, feedUrl]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const activePack =
    findCityPackById(
      CITY_PACKS.find((pack) => city.toLowerCase().includes(pack.name.split(",")[0].toLowerCase()))
        ?.id ?? "",
    ) ?? CITY_PACKS[0];

  const nowClock = clockInZone(new Date(nowTick), activePack.timezone);
  const saturdayDate = saturdayOf(windowStart, windowEnd);
  const sundayDate = sundayOf(windowStart, windowEnd);
  const satDepart = effectiveDepartAt(departAt, nowClock, saturdayDate);
  const sunDepart = sundayDate
    ? effectiveDepartAt(departAt, nowClock, sundayDate)
    : departAt;
  const usingNow =
    activeRouteDate(nowClock, windowStart, windowEnd) !== undefined &&
    ((nowClock.date === saturdayDate && satDepart !== departAt) ||
      (nowClock.date === sundayDate && sunDepart !== departAt));
  const warning = plan
    ? primaryWarning(liveWarnings(plan, nowClock, windowStart, windowEnd))
    : undefined;
  const remaining = plan
    ? remainingSummary(plan, nowClock, windowStart, windowEnd)
    : null;

  async function build(
    nextStart = here ?? {
      label: address,
      lat: activePack.defaultStart.lat,
      lng: activePack.defaultStart.lng,
    },
    nextExclude = excludeIds,
    reuseSales?: Sale[],
  ) {
    setBusy(true);
    setError("");
    try {
      const resolved = await geocodeAddress(nextStart.label);
      const start = resolved ?? {
        lat: nextStart.lat,
        lng: nextStart.lng,
        label: nextStart.label,
      };
      if (
        !resolved &&
        !here &&
        nextStart.label !== activePack.defaultStart.label &&
        nextStart.lat === activePack.defaultStart.lat
      ) {
        setError("Could not geocode that start address. Using the city-pack pin, or tap Use my location.");
      }

      const query: HuntQuery = {
        ...queryBase,
        excludeIds: nextExclude,
        start,
        startLabel: start.label,
        departAt: satDepart,
        sundayDepartAt: sunDepart,
      };
      const loaded = reuseSales
        ? { sales: reuseSales, note: plan?.sourceNote ?? "Using the current list." }
        : await loadSales(query, pasted, feedUrl);
      if (!reuseSales) setSalesCache(loaded.sales);
      const matrix = await fetchOsrmMatrix([start, ...loaded.sales]);
      const nextPlan = planRoute(loaded.sales, query, loaded.note, matrix);
      setPlan(nextPlan);
      const stub = await licensedFeedAdapter(feedUrl).load(query);
      setFeedNote(stub.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build a route.");
    } finally {
      setBusy(false);
    }
  }

  function toggleCategory(id: CategoryId) {
    setCategories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function selectPack(packId: string) {
    const pack = findCityPackById(packId);
    if (!pack) return;
    setCity(pack.name.split(",")[0]);
    setZip(pack.defaultStart.label.match(/\b(\d{5})\b/)?.[1] ?? pack.zips[0] ?? "");
    setAddress(pack.defaultStart.label);
    setHere(null);
    setExcludeIds([]);
  }

  function locate() {
    if (!navigator.geolocation) {
      setError("This browser cannot share a location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const label = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        setAddress(label);
        setHere(null);
        setExcludeIds([]);
        setLocating(false);
        void build({
          label,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }, []);
      },
      () => {
        setLocating(false);
        setError("Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function skipStop(id: string) {
    const next = [...new Set([...excludeIds, id])];
    setExcludeIds(next);
    void build(here ?? {
      label: address,
      lat: activePack.defaultStart.lat,
      lng: activePack.defaultStart.lng,
    }, next, salesCache);
  }

  function startHere(id: string) {
    const stop =
      plan?.saturday.find((item) => item.sale.id === id) ??
      plan?.sunday.find((item) => item.sale.id === id);
    if (!stop) return;
    const passed = [
      ...plan!.saturday
        .slice(0, plan!.saturday.findIndex((item) => item.sale.id === id) + 1)
        .map((item) => item.sale.id),
      id,
    ];
    const nextExclude = [...new Set([...excludeIds, ...passed])];
    const nextHere = {
      lat: stop.sale.lat,
      lng: stop.sale.lng,
      label: stop.sale.address,
    };
    setHere(nextHere);
    setExcludeIds(nextExclude);
    void build(nextHere, nextExclude, salesCache);
  }

  function resetProgress() {
    setHere(null);
    setExcludeIds([]);
    setDoneIds([]);
    void build({
      label: address,
      lat: activePack.defaultStart.lat,
      lng: activePack.defaultStart.lng,
    }, [], salesCache);
  }

  function huntNow() {
    setDepartAt(clockToHhmm(clockInZone(new Date(), activePack.timezone).minutes));
    setNowTick(Date.now());
  }

  function startFromStop(id: string, nextExclude: string[]) {
    const stop =
      plan?.saturday.find((item) => item.sale.id === id) ??
      plan?.sunday.find((item) => item.sale.id === id);
    if (!stop) return;
    const nextHere = {
      lat: stop.sale.lat,
      lng: stop.sale.lng,
      label: stop.sale.address,
    };
    setHere(nextHere);
    void build(nextHere, nextExclude, salesCache);
  }

  function markDone(id: string) {
    const nextExclude = [...new Set([...excludeIds, id])];
    setExcludeIds(nextExclude);
    setDoneIds((current) => [...new Set([...current, id])]);
    if (!navigator.geolocation) {
      startFromStop(id, nextExclude);
      return;
    }
    setMarkingDone(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextHere = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Where you are",
        };
        setHere(nextHere);
        setMarkingDone(false);
        void build(nextHere, nextExclude, salesCache);
      },
      () => {
        setMarkingDone(false);
        startFromStop(id, nextExclude);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function copyShopperLink() {
    const result = shopperUrl(window.location.origin, window.location.pathname, {
      city,
      zip,
      windowStart,
      windowEnd,
      feedUrl,
      list: pasted,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    try {
      await navigator.clipboard.writeText(result.url);
      setShopperStatus("Shopper link copied");
      window.setTimeout(() => setShopperStatus(""), 2000);
    } catch {
      setError("Could not copy the shopper link.");
    }
  }

  function huntShareUrl() {
    return shareUrl(window.location.origin, window.location.pathname, {
      address,
      city,
      zip,
      categories,
      halfDay,
      departAt,
      feedUrl,
      windowStart,
      windowEnd,
    });
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(huntShareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the share link.");
    }
  }

  async function shareRoute() {
    if (!plan) return;
    const url = huntShareUrl();
    const text = formatRouteText(plan, {
      startLabel: here?.label ?? address,
      url,
    });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Weekend sale route", text });
        setShareStatus("Shared");
        window.setTimeout(() => setShareStatus(""), 2000);
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareStatus("Route copied");
      window.setTimeout(() => setShareStatus(""), 2000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        setShareStatus("Route copied");
        window.setTimeout(() => setShareStatus(""), 2000);
      } catch {
        setError("Could not share that route.");
      }
    }
  }

  return (
    <main className="app">
      <header className="masthead">
        <p className="eyebrow">Picker route</p>
        <h1>Weekend Sale Router</h1>
        <p className="lede">
          First, next, last — from your driveway, with early closes protected.
        </p>
      </header>

      {hostList ? (
        <p className="banner host">
          A host shared this weekend&apos;s list. Enter your driveway and tap
          Build route. This is their list, not a live directory.
        </p>
      ) : (
        <p className="banner">
          Demo seed is on. Live national directories are not scraped. Paste a
          list, read a photo, or point at a JSON feed you host.
        </p>
      )}

      <HuntForm
        address={address}
        city={city}
        zip={zip}
        windowStart={windowStart}
        windowEnd={windowEnd}
        categories={categories}
        halfDay={halfDay}
        departAt={departAt}
        pasted={pasted}
        feedUrl={feedUrl}
        locating={locating}
        busy={busy}
        readingPhoto={readingPhoto}
        onAddress={setAddress}
        onCity={setCity}
        onZip={setZip}
        onWindowStart={setWindowStart}
        onWindowEnd={setWindowEnd}
        onToggleCategory={toggleCategory}
        onHalfDay={setHalfDay}
        onDepartAt={setDepartAt}
        onPasted={setPasted}
        onFeedUrl={setFeedUrl}
        onReadingPhoto={setReadingPhoto}
        onSelectPack={selectPack}
        onLocate={locate}
        onThisWeekend={() => {
          const next = thisWeekend();
          setWindowStart(next.start);
          setWindowEnd(next.end);
        }}
        onHuntNow={huntNow}
        onCopyShopperLink={() => void copyShopperLink()}
        shopperStatus={shopperStatus}
        onSubmit={() => {
          setHere(null);
          setExcludeIds([]);
          setDoneIds([]);
          void build({
            label: address,
            lat: activePack.defaultStart.lat,
            lng: activePack.defaultStart.lng,
          }, []);
        }}
      />

      {error ? <p className="error">{error}</p> : null}

      {plan ? (
        <section>
          <div className="section-head">
            <h2>Saturday sweep</h2>
            <span className="empty">{formatDateRange(windowStart, windowEnd)}</span>
          </div>
          <p className="banner">{plan.sourceNote}</p>
          <p className="banner">
            {plan.driveSource === "osrm"
              ? "Drive times are road minutes from OpenStreetMap/OSRM."
              : "Drive times are a crow-flies estimate. OSRM was unavailable."}
          </p>
          {usingNow ? (
            <p className="banner">
              Using {minutesToClock(parseClock(nowClock.date === sundayDate ? sunDepart : satDepart))}{" "}
              (now) instead of your leave-at time.
            </p>
          ) : null}
          {remaining ? <p className="banner">{remaining}</p> : null}
          {warning ? (
            <div className={`banner late late-${warning.kind}`}>
              <span>{warning.message}</span>
              <button
                type="button"
                className="text-btn"
                onClick={() => skipStop(warning.stopId)}
              >
                Skip {warning.name}
              </button>
            </div>
          ) : null}
          {markingDone ? <p className="banner">Finding where you are…</p> : null}
          {here || excludeIds.length > 0 ? (
            <div className="banner progress">
              {here ? `Starting from ${here.label}. ` : ""}
              {doneIds.length > 0
                ? `${doneIds.length} done. `
                : null}
              {excludeIds.length - doneIds.length > 0
                ? `${excludeIds.length - doneIds.length} skipped. `
                : null}
              <button type="button" className="text-btn" onClick={resetProgress}>
                Reset progress
              </button>
            </div>
          ) : null}
          {plan.saturday.length === 0 ? (
            <p className="empty">No Saturday stops matched those filters.</p>
          ) : (
            plan.saturday.map((stop) => (
              <StopCard
                key={stop.sale.id}
                stop={stop}
                onSkip={skipStop}
                onStartHere={startHere}
                onDone={markDone}
              />
            ))
          )}

          {plan.skipped.length > 0 ? (
            <>
              <div className="section-head">
                <h2>Half-day skips</h2>
              </div>
              {plan.skipped.map((stop) => (
                <StopCard key={stop.sale.id} stop={stop} kind="skipped" />
              ))}
            </>
          ) : null}

          {plan.sunday.length > 0 ? (
            <>
              <div className="section-head">
                <h2>Sunday leftover</h2>
              </div>
              {plan.sunday.map((stop) => (
                <StopCard
                  key={stop.sale.id}
                  stop={stop}
                  kind="sunday"
                  onSkip={skipStop}
                  onStartHere={startHere}
                  onDone={markDone}
                />
              ))}
            </>
          ) : null}

          <div className="share-row">
            <button type="button" onClick={() => void shareRoute()}>
              {shareStatus || "Share as text"}
            </button>
            <button type="button" className="secondary" onClick={() => void copyShare()}>
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
          <button
            type="button"
            className="secondary"
            style={{ width: "100%", marginBottom: "1rem" }}
            onClick={() => void copyShopperLink()}
          >
            {shopperStatus || "Copy shopper link"}
          </button>

          <details className="details card">
            <summary>Demo vs live data</summary>
            <p className="empty">{feedNote}</p>
          </details>
        </section>
      ) : (
        <p className="empty">Build a route to see first → next → last.</p>
      )}

      {plan?.mapsUrl || plan?.sundayMapsUrl ? (
        <div className="dock">
          {plan.mapsUrl ? (
            <a className="map" href={plan.mapsUrl} target="_blank" rel="noreferrer">
              Open Saturday in Maps
            </a>
          ) : null}
          {plan.sundayMapsUrl ? (
            <a className="secondary-link" href={plan.sundayMapsUrl} target="_blank" rel="noreferrer">
              Open Sunday in Maps
            </a>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
