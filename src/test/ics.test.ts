import { describe, expect, it } from "vitest";
import { CITY_PACKS, hydrateCityPack } from "../data";
import {
  buildLeaveByIcs,
  escapeIcsText,
  leaveByEvents,
  wallTimeToUtc,
} from "../lib/ics";
import { planRoute } from "../lib/route";
import type { HuntQuery } from "../types";

describe("ICS helpers", () => {
  it("converts Pacific daylight wall time to UTC", () => {
    const utc = wallTimeToUtc("2026-08-15", 8 * 60 + 45, "America/Los_Angeles");
    expect(utc.toISOString()).toBe("2026-08-15T15:45:00.000Z");
  });

  it("escapes commas and newlines", () => {
    expect(escapeIcsText("A, B\nC")).toBe("A\\, B\\nC");
  });
});

describe("leave-by calendar", () => {
  const pack = CITY_PACKS[0];
  const query: HuntQuery = {
    start: pack.defaultStart,
    startLabel: pack.defaultStart.label,
    city: "Salem",
    zip: "97306",
    windowStart: "2026-08-15",
    windowEnd: "2026-08-16",
    categories: [],
    halfDay: false,
    departAt: "09:00",
  };

  it("builds a FIRST leave-by event for Saturday", () => {
    const plan = planRoute(hydrateCityPack(pack), query, "demo");
    expect(plan.saturday[0]?.leaveByMinutes).toBeGreaterThan(6 * 60);
    const events = leaveByEvents(plan, query.windowStart, query.windowEnd);
    expect(events[0]?.summary).toMatch(/^Leave for Saturday FIRST:/);
    expect(events.some((event) => event.summary.includes("Sunday"))).toBe(true);

    const ics = buildLeaveByIcs(events, pack.timezone, new Date("2026-08-14T17:00:00Z"));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT10M");
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).toContain(events[0]!.uid);
  });
});
