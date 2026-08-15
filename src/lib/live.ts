import type { RankedStop, RoutePlan } from "../types";
import { formatClock, parseClock, clockToHhmm } from "./hours";
import { saturdayOf, sundayOf } from "./weekend";

export interface ClockNow {
  date: string;
  minutes: number;
}

export interface LateWarning {
  stopId: string;
  name: string;
  kind: "closed" | "late" | "leave-now";
  message: string;
}

export function clockInZone(now: Date, timeZone: string): ClockNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    minutes: Number(read("hour")) * 60 + Number(read("minute")),
  };
}

export function activeRouteDate(
  now: ClockNow,
  windowStart: string,
  windowEnd: string,
): string | undefined {
  const saturday = saturdayOf(windowStart, windowEnd);
  const sunday = sundayOf(windowStart, windowEnd);
  if (now.date === saturday || now.date === sunday) return now.date;
  return undefined;
}

export function effectiveDepartAt(
  planned: string,
  now: ClockNow,
  routeDate: string,
): string {
  if (now.date !== routeDate) return planned;
  return now.minutes > parseClock(planned) ? clockToHhmm(now.minutes) : planned;
}

export function todaysStops(
  plan: RoutePlan,
  date: string,
  windowStart: string,
  windowEnd: string,
): RankedStop[] {
  const saturday = saturdayOf(windowStart, windowEnd);
  const sunday = sundayOf(windowStart, windowEnd);
  if (date === sunday) return plan.sunday;
  if (date === saturday) return plan.saturday;
  return [];
}

export function liveWarnings(
  plan: RoutePlan,
  now: ClockNow,
  windowStart: string,
  windowEnd: string,
): LateWarning[] {
  const stops = todaysStops(plan, now.date, windowStart, windowEnd);
  const warnings: LateWarning[] = [];

  for (const stop of stops) {
    if (stop.closeMinutes == null) continue;
    const drive = stop.driveMinutes ?? 0;
    const closeLabel = formatClock(clockToHhmm(stop.closeMinutes));
    const role = stop.role.toUpperCase();

    if (now.minutes >= stop.closeMinutes) {
      warnings.push({
        stopId: stop.sale.id,
        name: stop.sale.name,
        kind: "closed",
        message: `${stop.sale.name} already closed (${closeLabel}). Skip it.`,
      });
      continue;
    }

    const arriveIfLeaveNow = now.minutes + drive;
    if (arriveIfLeaveNow > stop.closeMinutes || stop.missed) {
      warnings.push({
        stopId: stop.sale.id,
        name: stop.sale.name,
        kind: "late",
        message: `${role} ${stop.sale.name} closes ${closeLabel}. Leave now and you still miss it — skip.`,
      });
      continue;
    }

    const slack = stop.closeMinutes - arriveIfLeaveNow;
    if (stop.role === "first" && slack <= 40) {
      warnings.push({
        stopId: stop.sale.id,
        name: stop.sale.name,
        kind: "leave-now",
        message: `FIRST ${stop.sale.name} closes ${closeLabel} — ${slack} min of slack. Leave now or skip.`,
      });
    }
  }

  return warnings;
}

export function primaryWarning(warnings: LateWarning[]): LateWarning | undefined {
  return (
    warnings.find((item) => item.kind === "closed") ??
    warnings.find((item) => item.kind === "late") ??
    warnings.find((item) => item.kind === "leave-now")
  );
}

export function remainingSummary(
  plan: RoutePlan,
  now: ClockNow,
  windowStart: string,
  windowEnd: string,
): string | null {
  const stops = todaysStops(plan, now.date, windowStart, windowEnd);
  if (now.date !== saturdayOf(windowStart, windowEnd) && now.date !== sundayOf(windowStart, windowEnd)) {
    return null;
  }
  if (stops.length === 0) return "No stops left today.";

  const lastClose = stops[stops.length - 1]?.closeMinutes;
  const driveSum = stops.reduce((sum, stop) => sum + (stop.driveMinutes ?? 0), 0);
  const parts = [`${stops.length} stop${stops.length === 1 ? "" : "s"} left`];
  if (lastClose != null) {
    const until = lastClose - now.minutes;
    parts.push(
      until <= 0
        ? "last close has passed"
        : `${Math.floor(until / 60)}h ${until % 60}m until last close`,
    );
  }
  parts.push(`~${Math.max(1, Math.round(driveSum))} min of driving`);
  return parts.join(" · ");
}
