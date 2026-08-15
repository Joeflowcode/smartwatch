import { describe, expect, it } from "vitest";
import { CITY_PACKS, hydrateCityPack } from "../data";
import {
  activeRouteDate,
  clockInZone,
  effectiveDepartAt,
  liveWarnings,
  primaryWarning,
  remainingSummary,
} from "../lib/live";
import { planRoute } from "../lib/route";
import type { HuntQuery } from "../types";

const pack = CITY_PACKS[0];
const sales = hydrateCityPack(pack);
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

describe("clock helpers", () => {
  it("reads Pacific time from a UTC instant", () => {
    const now = clockInZone(new Date("2026-08-15T18:10:00Z"), "America/Los_Angeles");
    expect(now.date).toBe("2026-08-15");
    expect(now.minutes).toBe(11 * 60 + 10);
  });

  it("bumps leave-at when the hunt date is already later", () => {
    expect(
      effectiveDepartAt("09:00", { date: "2026-08-15", minutes: 11 * 60 + 10 }, "2026-08-15"),
    ).toBe("11:10");
    expect(
      effectiveDepartAt("09:00", { date: "2026-08-14", minutes: 11 * 60 + 10 }, "2026-08-15"),
    ).toBe("09:00");
  });

  it("only treats Sat/Sun in the window as hunt days", () => {
    expect(
      activeRouteDate({ date: "2026-08-15", minutes: 600 }, "2026-08-15", "2026-08-16"),
    ).toBe("2026-08-15");
    expect(
      activeRouteDate({ date: "2026-08-14", minutes: 600 }, "2026-08-15", "2026-08-16"),
    ).toBeUndefined();
  });
});

describe("live warnings", () => {
  const plan = planRoute(sales, query, "demo");

  it("flags a noon close after 12:10", () => {
    const warnings = liveWarnings(
      plan,
      { date: "2026-08-15", minutes: 12 * 60 + 10 },
      "2026-08-15",
      "2026-08-16",
    );
    const first = primaryWarning(warnings);
    expect(first?.kind).toBe("closed");
    expect(first?.name).toMatch(/Independence/i);
  });

  it("tells you to leave now when FIRST is tight", () => {
    const warnings = liveWarnings(
      plan,
      { date: "2026-08-15", minutes: 11 * 60 + 10 },
      "2026-08-15",
      "2026-08-16",
    );
    expect(warnings.some((item) => item.kind === "leave-now" || item.kind === "late")).toBe(true);
    expect(warnings[0]?.name).toMatch(/Independence/i);
  });

  it("stays quiet on Friday", () => {
    expect(
      liveWarnings(plan, { date: "2026-08-14", minutes: 10 * 60 }, "2026-08-15", "2026-08-16"),
    ).toEqual([]);
  });

  it("summarizes remaining Saturday time", () => {
    const summary = remainingSummary(
      plan,
      { date: "2026-08-15", minutes: 9 * 60 },
      "2026-08-15",
      "2026-08-16",
    );
    expect(summary).toMatch(/stop/);
    expect(summary).toMatch(/until last close/);
  });
});
