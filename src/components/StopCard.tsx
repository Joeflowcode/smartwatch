import type { RankedStop } from "../types";

interface StopCardProps {
  stop: RankedStop;
  kind?: "saturday" | "sunday" | "skipped";
}

export function StopCard({ stop, kind = "saturday" }: StopCardProps) {
  const roleClass =
    kind === "skipped" ? "skip" : kind === "sunday" ? "sunday" : stop.role;
  const roleLabel =
    kind === "skipped"
      ? "Skip"
      : kind === "sunday"
        ? "Sunday"
        : stop.role;

  return (
    <article className="card stop">
      <div className="stop-top">
        <h3>{stop.sale.name}</h3>
        <span className={`role ${roleClass}`}>{roleLabel}</span>
      </div>
      <p className="address">{stop.sale.address}</p>
      <p className="meta">
        {stop.hoursLabel}
        {stop.closeLabel ? ` · ${stop.closeLabel}` : ""}
      </p>
      {stop.sale.tags.length > 0 ? (
        <div className="tags">
          {stop.sale.tags.map((tag) => (
            <span
              key={tag.id}
              className={tag.inferred ? "tag inferred" : "tag"}
            >
              {tag.label}
              {tag.inferred ? " · inferred" : ""}
            </span>
          ))}
        </div>
      ) : null}
      <p className="why">{stop.why}</p>
      <a className="secondary-link" href={stop.mapsUrl} target="_blank" rel="noreferrer">
        Open in Maps
      </a>
    </article>
  );
}
