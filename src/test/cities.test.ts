import { describe, expect, it } from "vitest";
import { CITY_PACKS, findCityPack, hydrateCityPack } from "../data";
import { partitionSales, planRoute, orderSaturday } from "../lib/route";

describe("city packs", () => {
  it("selects Salem seed and Portland labeled examples", () => {
    expect(findCityPack("Salem")?.id).toBe("salem-or");
    expect(findCityPack("Portland")?.kind).toBe("example");
    expect(CITY_PACKS.map((pack) => pack.id)).toEqual(["salem-or", "portland-or"]);
  });

  it("marks every Portland stop as a labeled example", () => {
    const pack = findCityPack("Portland");
    expect(pack).toBeTruthy();
    for (const sale of pack!.sales) {
      expect(`${sale.name} ${sale.description}`.toLowerCase()).toMatch(/example/);
      expect(sale.description.toLowerCase()).toMatch(/not a real sale/);
    }
  });

  it("routes Portland examples from the SE start", () => {
    const pack = findCityPack("Portland")!;
    const sales = hydrateCityPack(pack);
    const start = pack.defaultStart;
    const parts = partitionSales(sales, start, "2026-08-15", "2026-08-16", false);
    const ordered = orderSaturday(start, parts.saturday, "2026-08-15");
    expect(ordered[0]?.name).toMatch(/St Johns noon close/);
    expect(ordered.map((sale) => sale.name).join(" ")).toMatch(/Hawthorne/);
    expect(parts.sunday.map((sale) => sale.name).join(" ")).toMatch(/Pearl leftover/);

    const half = partitionSales(sales, start, "2026-08-15", "2026-08-16", true);
    expect(half.skipped.map((sale) => sale.name).join(" ")).toMatch(/St Johns/);

    const plan = planRoute(
      sales,
      {
        start,
        startLabel: start.label,
        city: "Portland",
        zip: "97214",
        windowStart: "2026-08-15",
        windowEnd: "2026-08-16",
        categories: [],
        halfDay: false,
        departAt: "09:00",
      },
      pack.dataNote,
    );
    expect(plan.saturday[0]?.leaveByLabel).toMatch(/Leave by /);
    expect(plan.saturday[0]?.role).toBe("first");
    expect(plan.saturday.at(-1)?.role).toBe("last");
  });
});
