import type { Sale, SaleHours } from "../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function parseClock(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatClock(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(":").map(Number);
  const suffix = hRaw >= 12 ? "pm" : "am";
  const hour = hRaw % 12 || 12;
  if (mRaw === 0) return `${hour}${suffix}`;
  return `${hour}:${String(mRaw).padStart(2, "0")}${suffix}`;
}

export function clockToHhmm(total: number): string {
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function minutesToClock(total: number): string {
  return formatClock(clockToHhmm(total));
}

export function formatDrive(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  return `${rounded} min drive`;
}

export function weekdayShort(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return WEEKDAYS[utc.getUTCDay()];
}

export function hoursOnDate(sale: Sale, date: string): SaleHours | undefined {
  return sale.hours.find((entry) => entry.date === date);
}

export function isOpenOn(sale: Sale, date: string): boolean {
  return Boolean(hoursOnDate(sale, date));
}

export function closeOn(sale: Sale, date: string): string | undefined {
  return hoursOnDate(sale, date)?.close;
}

export function formatHours(sale: Sale): string {
  const parts = sale.hours.map((entry) => {
    const day = weekdayShort(entry.date);
    return `${day} ${formatClock(entry.open)}–${formatClock(entry.close)}`;
  });
  const unique = [...new Set(parts)];
  const suffix = sale.lastDay ? " · LAST DAY" : "";
  return `${unique.join(", ")}${suffix}`;
}

export function formatClose(sale: Sale, date: string): string {
  const close = closeOn(sale, date);
  if (!close) return "Hours unknown";
  return `Closes ${formatClock(close)}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateRange(start: string, end: string): string {
  const label = (iso: string) => {
    const [, month, day] = iso.split("-").map(Number);
    return `${MONTHS[month - 1]} ${day}`;
  };
  if (start === end) return `${label(start)}, ${start.slice(0, 4)}`;
  return `${label(start)}–${label(end)}, ${start.slice(0, 4)}`;
}

export function parsePastedHours(text: string, weekend: string[]): SaleHours[] {
  const hours: SaleHours[] = [];
  const sat = weekend[0];
  const sun = weekend[1];

  const range = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const toClock = (
    hour: string,
    minute: string | undefined,
    suffix: string | undefined,
    fallbackSuffix: string,
  ) => {
    let h = Number(hour);
    const mer = (suffix || fallbackSuffix).toLowerCase();
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${(minute || "00").padStart(2, "0")}`;
  };

  const apply = (date: string, chunk: string) => {
    const match = chunk.match(range);
    if (!match) return;
    const closeSuffix = match[6] || match[3] || "pm";
    hours.push({
      date,
      open: toClock(match[1], match[2], match[3], closeSuffix),
      close: toClock(match[4], match[5], match[6], closeSuffix),
    });
  };

  if (/sat(?:urday)?\s*\/\s*sun/i.test(text) && sat && sun) {
    apply(sat, text);
    apply(sun, text);
    return hours;
  }

  const satMatch = text.match(/sat(?:urday)?[^,]*/i);
  const sunMatch = text.match(/sun(?:day)?[^,]*/i);
  if (satMatch && sat) apply(sat, satMatch[0]);
  if (sunMatch && sun) apply(sun, sunMatch[0]);
  return hours;
}
