import type { RankedStop, RoutePlan } from "../types";
import { clockInZone } from "./live";
import { clockToHhmm, minutesToClock } from "./hours";
import { saturdayOf, sundayOf } from "./weekend";

export interface LeaveByEvent {
  date: string;
  leaveMinutes: number;
  driveMinutes: number;
  summary: string;
  location: string;
  description: string;
  uid: string;
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, "0");
}

export function wallTimeToUtc(
  date: string,
  minutes: number,
  timeZone: string,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  let utc = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60, 0);
  for (let i = 0; i < 4; i++) {
    const clock = clockInZone(new Date(utc), timeZone);
    const [cy, cm, cd] = clock.date.split("-").map(Number);
    const wanted = Date.UTC(year, month - 1, day, 0, minutes);
    const got = Date.UTC(cy, cm - 1, cd, 0, clock.minutes);
    utc += wanted - got;
  }
  return new Date(utc);
}

export function formatUtcStamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return chunks.join("\r\n");
}

function eventBlock(event: LeaveByEvent, timeZone: string, now: Date): string {
  const start = wallTimeToUtc(event.date, Math.max(0, event.leaveMinutes), timeZone);
  const end = new Date(start.getTime() + Math.max(10, event.driveMinutes) * 60_000);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatUtcStamp(now)}`,
    `DTSTART:${formatUtcStamp(start)}`,
    `DTEND:${formatUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(event.summary)}`,
    "TRIGGER:-PT10M",
    "END:VALARM",
    "END:VEVENT",
  ];
  return lines.map(foldLine).join("\r\n");
}

function firstLeaveBy(
  stop: RankedStop | undefined,
  date: string,
  dayLabel: string,
): LeaveByEvent | null {
  if (!stop || stop.leaveByMinutes == null) return null;
  const openNote = stop.hoursLabel;
  return {
    date,
    leaveMinutes: stop.leaveByMinutes,
    driveMinutes: stop.driveMinutes ?? 15,
    summary: `Leave for ${dayLabel} FIRST: ${stop.sale.name}`,
    location: stop.sale.address,
    description: [
      `Leave by ${minutesToClock(stop.leaveByMinutes)} (${clockToHhmm(Math.max(0, stop.leaveByMinutes))}).`,
      stop.leaveByLabel,
      openNote,
      stop.mapsUrl,
    ]
      .filter(Boolean)
      .join("\n"),
    uid: `leaveby-${date}-${stop.sale.id}@weekend-sale-router`,
  };
}

export function leaveByEvents(
  plan: RoutePlan,
  windowStart: string,
  windowEnd: string,
): LeaveByEvent[] {
  const saturday = saturdayOf(windowStart, windowEnd);
  const sunday = sundayOf(windowStart, windowEnd);
  const events: LeaveByEvent[] = [];
  const sat = firstLeaveBy(plan.saturday[0], saturday, "Saturday");
  if (sat) events.push(sat);
  if (sunday) {
    const sun = firstLeaveBy(plan.sunday[0], sunday, "Sunday");
    if (sun) events.push(sun);
  }
  return events;
}

export function buildLeaveByIcs(
  events: LeaveByEvent[],
  timeZone: string,
  now = new Date(),
): string {
  const blocks = events.map((event) => eventBlock(event, timeZone, now));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Weekend Sale Router//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${timeZone}`,
    `X-WR-CALNAME:Sale route leave-by`,
    ...blocks,
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}

export async function openLeaveByCalendar(ics: string, filename = "leave-by.ics"): Promise<void> {
  const file = new File([ics], filename, { type: "text/calendar;charset=utf-8" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share: (data: ShareData) => Promise<void>;
  };
  if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: "Leave-by reminder" });
    return;
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
