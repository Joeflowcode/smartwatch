function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function thisWeekend(now = new Date()): { start: string; end: string } {
  const day = now.getDay();
  const saturday = new Date(now);
  if (day === 0) {
    saturday.setDate(now.getDate() - 1);
  } else if (day !== 6) {
    saturday.setDate(now.getDate() + (6 - day));
  }
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { start: isoDate(saturday), end: isoDate(sunday) };
}

export function weekendDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cursor <= last) {
    dates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function saturdayOf(windowStart: string, windowEnd: string): string {
  const dates = weekendDates(windowStart, windowEnd);
  return (
    dates.find((date) => new Date(`${date}T00:00:00`).getDay() === 6) ??
    dates[0]
  );
}

export function sundayOf(windowStart: string, windowEnd: string): string | undefined {
  return weekendDates(windowStart, windowEnd).find(
    (date) => new Date(`${date}T00:00:00`).getDay() === 0,
  );
}
