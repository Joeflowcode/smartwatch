import { describe, expect, it } from "vitest";
import { CITY_PACKS, hydrateCityPack } from "../data";
import { planRoute } from "../lib/route";
import {
  buildShareSearch,
  decodeList,
  encodeList,
  formatRouteOneLiner,
  formatRouteText,
  parseShare,
  shareUrl,
  shopperUrl,
} from "../lib/share";
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

  it("round-trips a pasted list in the hash for a shopper link", () => {
    const list = "Lion Heart — 860 Salem Heights Ave S — Sat 9am–1pm LAST DAY";
    expect(decodeList(encodeList(list))).toBe(list);

    const result = shopperUrl("https://example.net", "/", {
      city: "Salem",
      zip: "97306",
      windowStart: "2026-08-15",
      windowEnd: "2026-08-16",
      list,
    });
    expect("url" in result).toBe(true);
    if (!("url" in result)) return;
    expect(result.url).toContain("host=1");
    expect(result.url).not.toContain("address=");
    expect(result.url).toContain("#list=");

    const parsed = parseShare(
      result.url.slice(result.url.indexOf("?"), result.url.indexOf("#")),
      result.url.slice(result.url.indexOf("#")),
    );
    expect(parsed.host).toBe(true);
    expect(parsed.list).toBe(list);
    expect(parsed.city).toBe("Salem");
    expect(parsed.windowStart).toBe("2026-08-15");
  });

  it("refuses a shopper link with no list or feed", () => {
    const result = shopperUrl("https://example.net", "/", { city: "Salem" });
    expect(result).toEqual({
      error: "Paste a sale list (or a feed URL) before copying a shopper link.",
    });
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
