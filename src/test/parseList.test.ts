import { describe, expect, it } from "vitest";
import { parseMessySales } from "../lib/parseList";
import { parseUserSales } from "../lib/adapter/user";

const weekend = ["2026-08-15", "2026-08-16"];

const messy = `Independence Pickin Sale
115 S 6th St, Independence, OR 97351
Sat 9am-12pm LAST DAY

Lion Heart — 860 Salem Heights Ave S, Salem, OR 97302 — Sat 9am–1pm LAST DAY — antiques, books, instruments

All Things West
570 Winners Ct NW, Salem, OR 97304
Sat/Sun 9am–3pm
jewelry, clock, garage`;

describe("messy sale list", () => {
  it("parses blank-line blocks and dashed one-liners", () => {
    const rows = parseMessySales(messy, weekend);
    expect(rows.map((row) => row.name)).toEqual([
      "Independence Pickin Sale",
      "Lion Heart",
      "All Things West",
    ]);
    expect(rows[0]?.address).toBe("115 S 6th St, Independence, OR 97351");
    expect(rows[0]?.lastDay).toBe(true);
    expect(rows[1]?.description).toMatch(/antiques/i);
    expect(rows[2]?.hours).toHaveLength(2);
  });

  it("hydrates known Salem addresses without a live geocode", () => {
    const sales = parseUserSales(messy, weekend);
    expect(sales).toHaveLength(3);
    expect(sales[0]?.lat).toBeCloseTo(44.8528, 3);
    expect(sales[1]?.tags.some((tag) => tag.id === "vintage")).toBe(true);
    expect(sales[2]?.tags.map((tag) => tag.id)).toContain("jewelry");
  });

  it("pins a street-only line from the Salem seed", () => {
    const sales = parseUserSales(
      "Lion Heart\n860 Salem Heights Ave S\nSat 9am-1pm LAST DAY — antiques",
      weekend,
    );
    expect(sales).toHaveLength(1);
    expect(sales[0]?.lat).toBeCloseTo(44.908, 3);
    expect(sales[0]?.address).toMatch(/Salem Heights/i);
  });

  it("accepts a full address that omits the ZIP", () => {
    const rows = parseMessySales(
      "Yard sale — 4182 Barrett St S, Salem, OR — Sat 9am-3pm — electronics",
      weekend,
    );
    expect(rows[0]?.address).toBe("4182 Barrett St S, Salem, OR");
    const sales = parseUserSales(
      "Yard sale — 4182 Barrett St S, Salem, OR — Sat 9am-3pm — electronics",
      weekend,
    );
    expect(sales[0]?.name).toBe("Yard sale");
    expect(sales[0]?.lat).toBeCloseTo(44.8955, 3);
  });

  it("accepts JSON that omits lat/lng when the address is in the seed", () => {
    const sales = parseUserSales(
      JSON.stringify([
        {
          name: "J House South",
          address: "5980 Smoketree Dr SE, Salem, OR 97306",
          description: "TVs, cameras, vintage books, tools",
          lastDay: true,
          hours: [{ date: "2026-08-15", open: "09:00", close: "17:00" }],
        },
      ]),
      weekend,
    );
    expect(sales).toHaveLength(1);
    expect(sales[0]?.lng).toBeCloseTo(-123.038, 2);
  });
});
