import { CATEGORIES, type CategoryId } from "../types";

interface HuntFormProps {
  address: string;
  city: string;
  zip: string;
  windowStart: string;
  windowEnd: string;
  categories: CategoryId[];
  halfDay: boolean;
  pasted: string;
  locating: boolean;
  busy: boolean;
  onAddress: (value: string) => void;
  onCity: (value: string) => void;
  onZip: (value: string) => void;
  onWindowStart: (value: string) => void;
  onWindowEnd: (value: string) => void;
  onToggleCategory: (id: CategoryId) => void;
  onHalfDay: (value: boolean) => void;
  onPasted: (value: string) => void;
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
      <button type="button" className="ghost" onClick={props.onThisWeekend}>
        This weekend
      </button>
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
          JSON array with name, address, lat, lng, hours, and description.
          Inferred tags are marked. This is your list — not a live scrape.
        </p>
        <label className="field">
          <span>Pasted JSON</span>
          <textarea
            value={props.pasted}
            onChange={(event) => props.onPasted(event.target.value)}
            placeholder='[{"name":"Example","address":"...","lat":44.9,"lng":-123.0,"hours":[{"date":"2026-08-15","open":"09:00","close":"14:00"}],"description":"tools"}]'
          />
        </label>
        <label className="file-btn">
          Upload JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              props.onPasted(await file.text());
            }}
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
