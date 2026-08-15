import { describe, expect, it } from "vitest";
import { parseUserSales } from "../lib/adapter/user";
import { licensedFeedAdapter } from "../lib/adapter/licensed";

describe("user adapter", () => {
  it("hydrates pasted JSON and infers tags", () => {
    const sales = parseUserSales(
      JSON.stringify([
        {
          name: "Example garage sale (labeled example)",
          address: "350 Commercial St NE, Salem, OR 97301",
          lat: 44.9412,
          lng: -123.0395,
          description: "Tools, records, and a stereo. Clearly labeled example.",
          hours: [{ date: "2026-08-15", open: "08:00", close: "14:00" }],
        },
      ]),
      ["2026-08-15", "2026-08-16"],
    );
    expect(sales).toHaveLength(1);
    expect(sales[0]?.source).toBe("user");
    expect(sales[0]?.tags.map((tag) => tag.id)).toEqual([
      "electronics",
      "tools",
      "records",
    ]);
    expect(sales[0]?.tags.every((tag) => tag.inferred)).toBe(true);
  });
});

describe("licensed feed stub", () => {
  it("returns no sales and explains why", async () => {
    const result = await licensedFeedAdapter.load({
      start: { lat: 0, lng: 0 },
      startLabel: "",
      windowStart: "2026-08-15",
      windowEnd: "2026-08-16",
      categories: [],
      halfDay: false,
    });
    expect(result.sales).toEqual([]);
    expect(result.source).toBe("licensed-feed");
    expect(result.note.toLowerCase()).toContain("not connected");
  });
});
