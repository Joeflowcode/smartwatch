import { describe, expect, it } from "vitest";
import { buildShareSearch, parseShare, shareUrl } from "../lib/share";

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
