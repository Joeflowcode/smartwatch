import type { RankedStop } from "../types";

interface StopCardProps {
  stop: RankedStop;
  kind?: "saturday" | "sunday" | "skipped";
  onSkip?: (id: string) => void;
  onStartHere?: (id: string) => void;
}

export function StopCard({
  stop,
  kind = "saturday",
  onSkip,
  onStartHere,
}: StopCardProps) {
  const roleClass =
    kind === "skipped" ? "skip" : kind === "sunday" ? "sunday" : stop.role;
  const roleLabel =
    kind === "skipped"
      ? "Skip"
      : kind === "sunday"
        ? `Sun ${stop.role}`
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
      {stop.driveLabel && stop.arriveLabel ? (
        <p className={`timing${stop.missed ? " missed" : ""}`}>
          {stop.driveLabel} · {stop.arriveLabel}
          {stop.leaveLabel ? ` · ${stop.leaveLabel}` : ""}
          {stop.timingNote ? ` · ${stop.timingNote}` : ""}
        </p>
      ) : null}
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
      {kind !== "skipped" && (onSkip || onStartHere) ? (
        <div className="stop-actions">
          {onStartHere ? (
            <button type="button" className="ghost" onClick={() => onStartHere(stop.sale.id)}>
              Start here
            </button>
          ) : null}
          {onSkip ? (
            <button type="button" className="ghost" onClick={() => onSkip(stop.sale.id)}>
              Skip
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
