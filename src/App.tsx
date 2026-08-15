import { useMemo, useState } from "react";
import { HuntForm } from "./components/HuntForm";
import { StopCard } from "./components/StopCard";
import { CITY_PACKS } from "./data";
import { loadSales } from "./lib/adapter";
import { licensedFeedAdapter } from "./lib/adapter/licensed";
import { geocodeAddress } from "./lib/geocode";
import { planRoute } from "./lib/route";
import { formatDateRange } from "./lib/hours";
import { thisWeekend } from "./lib/weekend";
import type { CategoryId, HuntQuery, RoutePlan } from "./types";

const DEMO_START = CITY_PACKS[0].defaultStart;
const weekend = thisWeekend();

export default function App() {
  const [address, setAddress] = useState(DEMO_START.label);
  const [city, setCity] = useState("Salem");
  const [zip, setZip] = useState("97306");
  const [windowStart, setWindowStart] = useState(weekend.start);
  const [windowEnd, setWindowEnd] = useState(weekend.end);
  const [categories, setCategories] = useState<CategoryId[]>([]);
  const [halfDay, setHalfDay] = useState(false);
  const [pasted, setPasted] = useState("");
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [feedNote, setFeedNote] = useState("");

  const queryBase = useMemo(
    () => ({
      city,
      zip,
      windowStart,
      windowEnd,
      categories,
      halfDay,
    }),
    [city, zip, windowStart, windowEnd, categories, halfDay],
  );

  async function build(nextStart = { label: address, lat: DEMO_START.lat, lng: DEMO_START.lng }) {
    setBusy(true);
    setError("");
    try {
      const resolved = await geocodeAddress(nextStart.label);
      const start = resolved ?? {
        lat: nextStart.lat,
        lng: nextStart.lng,
        label: nextStart.label,
      };
      if (!resolved && nextStart.label !== DEMO_START.label && nextStart.lat === DEMO_START.lat) {
        setError("Could not geocode that start address. Using the Salem demo pin, or tap Use my location.");
      }

      const query: HuntQuery = {
        ...queryBase,
        start,
        startLabel: start.label,
      };
      const loaded = await loadSales(query, pasted);
      const nextPlan = planRoute(loaded.sales, query, loaded.note);
      setPlan(nextPlan);
      const stub = await licensedFeedAdapter.load(query);
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
        setLocating(false);
        void build({
          label,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setError("Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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

      <p className="banner">
        Demo seed is on. Live national directories are not scraped. Paste your
        own list or wait for a licensed feed.
      </p>

      <HuntForm
        address={address}
        city={city}
        zip={zip}
        windowStart={windowStart}
        windowEnd={windowEnd}
        categories={categories}
        halfDay={halfDay}
        pasted={pasted}
        locating={locating}
        busy={busy}
        onAddress={setAddress}
        onCity={setCity}
        onZip={setZip}
        onWindowStart={setWindowStart}
        onWindowEnd={setWindowEnd}
        onToggleCategory={toggleCategory}
        onHalfDay={setHalfDay}
        onPasted={setPasted}
        onLocate={locate}
        onThisWeekend={() => {
          const next = thisWeekend();
          setWindowStart(next.start);
          setWindowEnd(next.end);
        }}
        onSubmit={() => void build({ label: address, lat: DEMO_START.lat, lng: DEMO_START.lng })}
      />

      {error ? <p className="error">{error}</p> : null}

      {plan ? (
        <section>
          <div className="section-head">
            <h2>Saturday sweep</h2>
            <span className="empty">{formatDateRange(windowStart, windowEnd)}</span>
          </div>
          <p className="banner">{plan.sourceNote}</p>
          {plan.saturday.length === 0 ? (
            <p className="empty">No Saturday stops matched those filters.</p>
          ) : (
            plan.saturday.map((stop) => <StopCard key={stop.sale.id} stop={stop} />)
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
                <StopCard key={stop.sale.id} stop={stop} kind="sunday" />
              ))}
            </>
          ) : null}

          <details className="details card">
            <summary>Demo vs live data</summary>
            <p className="empty">{feedNote}</p>
          </details>
        </section>
      ) : (
        <p className="empty">Build a route to see first → next → last.</p>
      )}

      {plan?.mapsUrl ? (
        <div className="dock">
          <a className="map" href={plan.mapsUrl} target="_blank" rel="noreferrer">
            Open whole route in Maps
          </a>
        </div>
      ) : null}
    </main>
  );
}
