import { describe, expect, it } from "vitest";
import { formatClock, parsePastedHours } from "../lib/hours";
import { thisWeekend } from "../lib/weekend";

describe("hours", () => {
  it("formats 24h clocks for a phone list", () => {
    expect(formatClock("09:00")).toBe("9am");
    expect(formatClock("12:00")).toBe("12pm");
    expect(formatClock("13:00")).toBe("1pm");
    expect(formatClock("18:30")).toBe("6:30pm");
  });

  it("parses Sat/Sun pasted ranges", () => {
    const hours = parsePastedHours("Sat/Sun 9am–3pm", ["2026-08-15", "2026-08-16"]);
    expect(hours).toEqual([
      { date: "2026-08-15", open: "09:00", close: "15:00" },
      { date: "2026-08-16", open: "09:00", close: "15:00" },
    ]);
  });
});

describe("thisWeekend", () => {
  it("uses Sat–Sun of the current weekend on Saturday Aug 15 2026", () => {
    const result = thisWeekend(new Date(2026, 7, 15, 8, 0, 0));
    expect(result).toEqual({ start: "2026-08-15", end: "2026-08-16" });
  });
});
