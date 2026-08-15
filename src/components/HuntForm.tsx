import { CITY_PACKS } from "../data";
import { isImageFile, readSalePhoto } from "../lib/ocr";
import { CATEGORIES, type CategoryId } from "../types";

interface HuntFormProps {
  address: string;
  city: string;
  zip: string;
  windowStart: string;
  windowEnd: string;
  categories: CategoryId[];
  halfDay: boolean;
  departAt: string;
  pasted: string;
  feedUrl: string;
  locating: boolean;
  busy: boolean;
  readingPhoto: boolean;
  onAddress: (value: string) => void;
  onCity: (value: string) => void;
  onZip: (value: string) => void;
  onWindowStart: (value: string) => void;
  onWindowEnd: (value: string) => void;
  onToggleCategory: (id: CategoryId) => void;
  onHalfDay: (value: boolean) => void;
  onDepartAt: (value: string) => void;
  onPasted: (value: string) => void;
  onFeedUrl: (value: string) => void;
  onReadingPhoto: (value: boolean) => void;
  onSelectPack: (packId: string) => void;
  onLocate: () => void;
  onThisWeekend: () => void;
  onSubmit: () => void;
}

export function HuntForm(props: HuntFormProps) {
  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
    >
      <label className="field">
        <span>Start address (US)</span>
        <input
          type="text"
          autoComplete="street-address"
          enterKeyHint="search"
          value={props.address}
          onChange={(event) => props.onAddress(event.target.value)}
          placeholder="1980 Madras St SE, Salem, OR 97306"
        />
      </label>
      <div className="actions">
        <button type="button" className="secondary" onClick={props.onLocate} disabled={props.locating}>
          {props.locating ? "Finding you…" : "Use my location"}
        </button>
      </div>
      <p className="section-label" style={{ margin: "0.85rem 0 0.55rem" }}>
        City pack
      </p>
      <div className="chips">
        {CITY_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            className="chip"
            aria-pressed={props.city.toLowerCase().includes(pack.name.split(",")[0].toLowerCase())}
            onClick={() => props.onSelectPack(pack.id)}
          >
            {pack.name}
            {pack.kind === "example" ? " · examples" : ""}
          </button>
        ))}
      </div>
      <div className="row">
        <label className="field">
          <span>City</span>
          <input
            type="text"
            value={props.city}
            onChange={(event) => props.onCity(event.target.value)}
            placeholder="Salem"
          />
        </label>
        <label className="field">
          <span>ZIP</span>
          <input
            type="text"
            inputMode="numeric"
            value={props.zip}
            onChange={(event) => props.onZip(event.target.value)}
            placeholder="97306"
          />
        </label>
      </div>
      <div className="row">
        <label className="field">
          <span>From</span>
          <input
            type="date"
            value={props.windowStart}
            onChange={(event) => props.onWindowStart(event.target.value)}
          />
        </label>
        <label className="field">
          <span>To</span>
          <input
            type="date"
            value={props.windowEnd}
            onChange={(event) => props.onWindowEnd(event.target.value)}
          />
        </label>
      </div>
      <div className="row">
        <label className="field">
          <span>Leave at</span>
          <input
            type="time"
            value={props.departAt}
            onChange={(event) => props.onDepartAt(event.target.value)}
          />
        </label>
        <div className="field">
          <span>&nbsp;</span>
          <button type="button" className="ghost" onClick={props.onThisWeekend}>
            This weekend
          </button>
        </div>
      </div>
      <p className="section-label" style={{ margin: "1rem 0 0.55rem" }}>
        Hunt list
      </p>
      <div className="chips">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className="chip"
            aria-pressed={props.categories.includes(category.id)}
            onClick={() => props.onToggleCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="toggle">
        <div>
          <strong>Half-day mode</strong>
          <div className="empty">Skip far noon-close outliers.</div>
        </div>
        <button
          type="button"
          className={props.halfDay ? undefined : "secondary"}
          aria-pressed={props.halfDay}
          onClick={() => props.onHalfDay(!props.halfDay)}
        >
          {props.halfDay ? "On" : "Off"}
        </button>
      </div>
      <details className="details">
        <summary>Paste or upload a sale list</summary>
        <p className="empty">
          Paste messy notes or JSON. A name, US address, and Sat/Sun hours
          are enough — coordinates are filled from the seed or the Census
          geocoder. This is your list, not a live scrape.
        </p>
        <label className="field">
          <span>Pasted sales</span>
          <textarea
            value={props.pasted}
            onChange={(event) => props.onPasted(event.target.value)}
            placeholder={"Lion Heart — 860 Salem Heights Ave S, Salem, OR 97302 — Sat 9am–1pm LAST DAY — antiques\n\nIndependence Pickin Sale\n115 S 6th St, Independence, OR 97351\nSat 9am-12pm LAST DAY"}
          />
        </label>
        <label className="file-btn">
          Upload JSON, text, or photo
          <input
            type="file"
            accept="application/json,.json,.txt,text/plain,image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (isImageFile(file)) {
                props.onReadingPhoto(true);
                try {
                  const text = await readSalePhoto(file);
                  if (!text) throw new Error("empty");
                  props.onPasted(props.pasted ? `${props.pasted}\n\n${text}` : text);
                } catch {
                  props.onPasted(
                    props.pasted ||
                      "# Could not read that photo. Type or paste the sale list instead.",
                  );
                } finally {
                  props.onReadingPhoto(false);
                }
                return;
              }
              props.onPasted(await file.text());
            }}
          />
        </label>
        {props.readingPhoto ? <p className="empty">Reading photo…</p> : null}
        <label className="field">
          <span>Optional feed URL</span>
          <input
            type="text"
            inputMode="url"
            value={props.feedUrl}
            onChange={(event) => props.onFeedUrl(event.target.value)}
            placeholder="/feeds/example.json"
          />
        </label>
      </details>
      <div className="actions" style={{ marginTop: "0.9rem" }}>
        <button type="submit" disabled={props.busy}>
          {props.busy ? "Building…" : "Build route"}
        </button>
      </div>
    </form>
  );
}
