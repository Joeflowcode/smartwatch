import { describe, expect, it } from "vitest";
import { inferTags, saleMatchesCategories } from "../lib/tags";

describe("inferTags", () => {
  it("marks keyword hits as inferred", () => {
    const tags = inferTags("TVs, cameras, vintage books, tools");
    expect(tags.map((tag) => tag.id)).toEqual([
      "electronics",
      "vintage",
      "tools",
      "cameras",
    ]);
    expect(tags.every((tag) => tag.inferred)).toBe(true);
  });

  it("maps pickin and antiques to vintage", () => {
    expect(inferTags("Independence Pickin Sale").map((tag) => tag.id)).toContain(
      "vintage",
    );
    expect(inferTags("Antiques, books, instruments").map((tag) => tag.id)).toContain(
      "vintage",
    );
  });

  it("maps games and consoles to games plus electronics", () => {
    const tags = inferTags("Games and consoles advertised");
    expect(tags.map((tag) => tag.id)).toEqual(["electronics", "games"]);
  });

  it("maps jewelry without inventing extra categories from clock/garage", () => {
    expect(inferTags("Jewelry, clock, garage").map((tag) => tag.id)).toEqual([
      "jewelry",
    ]);
  });

  it("maps vintage toys and photography", () => {
    expect(
      inferTags("Vintage toys, photography, hobby room").map((tag) => tag.id),
    ).toEqual(["vintage", "cameras", "toys"]);
  });
});

describe("saleMatchesCategories", () => {
  const tags = inferTags("TVs, cameras, vintage books, tools");

  it("passes when no filters are selected", () => {
    expect(saleMatchesCategories(tags, [])).toBe(true);
  });

  it("matches any selected hunt tag", () => {
    expect(saleMatchesCategories(tags, ["electronics", "vintage"])).toBe(true);
    expect(saleMatchesCategories(tags, ["jewelry"])).toBe(false);
  });
});
