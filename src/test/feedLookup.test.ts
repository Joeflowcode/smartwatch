import { afterEach, describe, expect, it, vi } from "vitest";
import { licensedFeedAdapter } from "../lib/adapter/licensed";
import { parseJsonSales } from "../lib/parseList";
import {
  fillFeedTemplate,
  salesLookupPath,
  templateNeedsZip,
} from "../lib/feedLookup";
import type { HuntQuery } from "../types";

describe("feed template", () => {
  it("fills ZIP, city, and weekend dates", () => {
    expect(
      fillFeedTemplate("https://partner.example/q?zip={zip}&city={city}&from={start}&to={end}", {
        zip: "97306-1234",
        city: "Salem",
        start: "2026-08-15",
        end: "2026-08-16",
      }),
    ).toBe(
      "https://partner.example/q?zip=97306&city=Salem&from=2026-08-15&to=2026-08-16",
    );
  });

  it("knows when a template requires a ZIP", () => {
    expect(templateNeedsZip("https://x.example/{zip}")).toBe(true);
    expect(templateNeedsZip("https://x.example/all.json")).toBe(false);
  });

  it("builds the ZIP lookup path", () => {
    expect(
      salesLookupPath({ zip: "97306", city: "Salem", start: "2026-08-15", end: "2026-08-16" }),
    ).toBe("/api/sales?zip=97306&city=Salem&start=2026-08-15&end=2026-08-16");
  });
});

describe("wrapped feed JSON", () => {
  it("reads a { sales: [] } envelope", () => {
    const rows = parseJsonSales(
      JSON.stringify({
        sales: [
          {
            name: "Envelope sale",
            address: "350 Commercial St NE, Salem, OR 97301",
          },
        ],
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("Envelope sale");
  });
});

describe("licensed ZIP lookup", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const query: HuntQuery = {
    start: { lat: 0, lng: 0 },
    startLabel: "",
    city: "Salem",
    zip: "97306",
    windowStart: "2026-08-15",
    windowEnd: "2026-08-16",
    categories: [],
    halfDay: false,
  };

  it("stays empty when the partner URL is not configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            connected: false,
            sales: [],
            note: "Licensed live feed is not connected. Set SALES_FEED_TEMPLATE.",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const result = await licensedFeedAdapter().load(query);
    expect(result.sales).toEqual([]);
    expect(result.note.toLowerCase()).toMatch(/not connected/);
  });

  it("loads partner sales for the hunt ZIP", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/api/sales?");
      expect(String(input)).toContain("zip=97306");
      return new Response(
        JSON.stringify([
          {
            name: "Partner sale (labeled example)",
            address: "350 Commercial St NE, Salem, OR 97301",
            lat: 44.9412,
            lng: -123.0395,
            description: "Labeled example from a licensed ZIP lookup. Vintage.",
            hours: [{ date: "2026-08-15", open: "09:00", close: "14:00" }],
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await licensedFeedAdapter().load(query);
    expect(result.sales).toHaveLength(1);
    expect(result.sales[0]?.source).toBe("licensed-feed");
    expect(result.note).toMatch(/97306/);
    expect(result.note.toLowerCase()).not.toMatch(/scrape of/);
  });
});
