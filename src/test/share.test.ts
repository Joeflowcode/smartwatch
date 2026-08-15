import { describe, expect, it } from "vitest";
import { CITY_PACKS, hydrateCityPack } from "../data";
import { planRoute } from "../lib/route";
import { buildShareSearch, formatRouteOneLiner, formatRouteText, parseShare, shareUrl } from "../lib/share";
import type { HuntQuery } from "../types";

describe("share links", () => {
  it("round-trips hunt state", () => {
    const search = buildShareSearch({
      address: "1980 Madras St SE, Salem, OR 97306",
      city: "Salem",
      zip: "97306",
      categories: ["electronics", "vintage"],
      halfDay: true,
      departAt: "08:30",
      feedUrl: "/feeds/example.json",
    });
    const parsed = parseShare(search);
    expect(parsed.city).toBe("Salem");
    expect(parsed.categories).toEqual(["electronics", "vintage"]);
    expect(parsed.halfDay).toBe(true);
    expect(parsed.departAt).toBe("08:30");
    expect(parsed.feedUrl).toBe("/feeds/example.json");
  });

  it("builds an absolute URL", () => {
    expect(
      shareUrl("https://example.net", "/", { city: "Portland", zip: "97214" }),
    ).toBe("https://example.net/?city=Portland&zip=97214");
  });
});

describe("share as text", () => {
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
  };

  it("writes FIRST / NEXT / LAST as a pasteable block", () => {
    const plan = planRoute(hydrateCityPack(pack), query, "demo");
    const one = formatRouteOneLiner(plan);
    expect(one).toMatch(/^FIRST /);
    expect(one).toContain(" · NEXT ");
    expect(one).toContain(" · LAST ");

    const text = formatRouteText(plan, {
      startLabel: pack.defaultStart.label,
      url: "https://example.net/route",
    });
    expect(text).toContain(one);
    expect(text).toMatch(/Sunday leftover/i);
    expect(text).toContain("All Things West");
    expect(text).toContain("https://example.net/route");
    expect(text).toContain(pack.defaultStart.label);
  });
});
