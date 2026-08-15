import { describe, expect, it } from "vitest";
import { hydrateCityPack, CITY_PACKS } from "../data";
import { partitionSales, planRoute, orderSaturday, timeStops } from "../lib/route";
import type { HuntQuery } from "../types";

const pack = CITY_PACKS[0];
const sales = hydrateCityPack(pack);
const start = pack.defaultStart;
const saturday = "2026-08-15";
const sunday = "2026-08-16";

function query(overrides: Partial<HuntQuery> = {}): HuntQuery {
  return {
    start,
    startLabel: start.label,
    city: "Salem",
    zip: "97306",
    windowStart: saturday,
    windowEnd: sunday,
    categories: [],
    halfDay: false,
    ...overrides,
  };
}

describe("Salem Aug 15–16 2026 seed", () => {
  it("keeps All Things West as a Sunday leftover", () => {
    const parts = partitionSales(sales, start, saturday, sunday, false);
    expect(parts.sunday.map((sale) => sale.name)).toEqual(["All Things West"]);
    expect(parts.saturday.map((sale) => sale.name)).not.toContain("All Things West");
  });

  it("orders Saturday Independence → Lion Heart → South → J House South → M&E → J House East → Fairgrounds", () => {
    const parts = partitionSales(sales, start, saturday, sunday, false);
    const ordered = orderSaturday(start, parts.saturday, saturday);
    expect(ordered.map((sale) => sale.name)).toEqual([
      "Independence Pickin Sale",
      "Lion Heart",
      "All Things South",
      "J House South",
      "M&E huge",
      "J House East",
      "Fairgrounds flea",
    ]);
  });

  it("half-day mode skips Independence", () => {
    const parts = partitionSales(sales, start, saturday, sunday, true);
    expect(parts.skipped.map((sale) => sale.name)).toEqual([
      "Independence Pickin Sale",
    ]);
    const ordered = orderSaturday(start, parts.saturday, saturday);
    expect(ordered[0]?.name).toBe("Lion Heart");
    expect(ordered.map((sale) => sale.name)).not.toContain(
      "Independence Pickin Sale",
    );
  });

  it("filters electronics + vintage and still returns a first-to-last Saturday list", () => {
    const plan = planRoute(sales, query({ categories: ["electronics", "vintage"] }), "demo");
    expect(plan.saturday.length).toBeGreaterThan(2);
    expect(plan.saturday[0]?.role).toBe("first");
    expect(plan.saturday.at(-1)?.role).toBe("last");
    expect(
      plan.saturday.every((stop) =>
        stop.sale.tags.some((tag) => tag.id === "electronics" || tag.id === "vintage"),
      ),
    ).toBe(true);
    expect(plan.saturday.map((stop) => stop.sale.name)).toContain("J House South");
    expect(plan.saturday.map((stop) => stop.sale.name)).toContain("Lion Heart");
  });

  it("assigns FIRST / NEXT / LAST and a multi-stop Maps link", () => {
    const plan = planRoute(sales, query(), "demo");
    expect(plan.saturday[0]?.role).toBe("first");
    expect(plan.saturday.slice(1, -1).every((stop) => stop.role === "next")).toBe(true);
    expect(plan.saturday.at(-1)?.role).toBe("last");
    expect(plan.mapsUrl).toContain("https://www.google.com/maps/dir/?");
    expect(plan.mapsUrl).toContain("waypoints=");
    expect(plan.saturday.every((stop) => stop.mapsUrl.includes("destination="))).toBe(true);
    expect(plan.saturday.every((stop) => stop.why.length > 0)).toBe(true);
    expect(plan.driveSource).toBe("haversine");
  });

  it("stamps drive and arrival times from a 9am depart", () => {
    const ordered = orderSaturday(
      start,
      partitionSales(sales, start, saturday, sunday, false).saturday,
      saturday,
    );
    const times = timeStops(start, ordered, saturday, 9 * 60);
    expect(times[0]?.arrive).toBeGreaterThan(9 * 60);
    expect(times[0]?.arrive).toBeLessThan(10 * 60);
    const plan = planRoute(sales, query({ departAt: "09:00" }), "demo");
    expect(plan.saturday[0]?.arriveLabel).toMatch(/Arrive /);
    expect(plan.saturday[0]?.driveLabel).toMatch(/min drive/);
  });

  it("drops skipped stops and rebuilds from the remaining pool", () => {
    const independence = sales.find((sale) => sale.name === "Independence Pickin Sale");
    const plan = planRoute(
      sales,
      query({ excludeIds: independence ? [independence.id] : [] }),
      "demo",
    );
    expect(plan.saturday.map((stop) => stop.sale.name)).not.toContain(
      "Independence Pickin Sale",
    );
    expect(plan.saturday[0]?.sale.name).toBe("Lion Heart");
  });

  it("builds a Sunday leftover route with its own Maps link", () => {
    const plan = planRoute(sales, query(), "demo");
    expect(plan.sunday.map((stop) => stop.sale.name)).toEqual(["All Things West"]);
    expect(plan.sunday[0]?.role).toBe("first");
    expect(plan.sunday[0]?.arriveLabel).toMatch(/Arrive /);
    expect(plan.sundayMapsUrl).toContain("destination=");
    expect(decodeURIComponent(plan.sundayMapsUrl!.replace(/\+/g, " "))).toContain(
      "570 Winners Ct NW",
    );
  });
});
