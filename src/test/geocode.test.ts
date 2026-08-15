import { afterEach, describe, expect, it, vi } from "vitest";
import { parseUserSalesAsync } from "../lib/adapter/user";
import { completeAddress, hintFromHunt, knownPoint } from "../lib/geocode";

const weekend = ["2026-08-15", "2026-08-16"];

describe("completeAddress", () => {
  it("appends city, state, and ZIP when the line is only a street", () => {
    expect(completeAddress("100 Test St", hintFromHunt("Salem", "97301"))).toBe(
      "100 Test St, Salem, OR 97301",
    );
  });

  it("does not duplicate a city that is already in the line", () => {
    expect(
      completeAddress("100 Test St, Salem, OR 97301", hintFromHunt("Salem", "97301")),
    ).toBe("100 Test St, Salem, OR 97301");
  });
});

describe("knownPoint", () => {
  it("matches a seed street without city or ZIP", () => {
    const point = knownPoint("115 S 6th St");
    expect(point?.lat).toBeCloseTo(44.8528, 3);
    expect(point?.label).toMatch(/Independence/i);
  });
});

describe("parseUserSalesAsync geocode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks Census for an unknown street using the hunt city", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toMatch(/\/api\/geocode\?/);
      expect(decodeURIComponent(url)).toMatch(/100 Test St.*Salem.*OR.*97301/);
      return new Response(
        JSON.stringify({
          lat: 44.9412,
          lng: -123.0395,
          label: "100 TEST ST, SALEM, OR, 97301",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await parseUserSalesAsync(
      "Test Sale\n100 Test St\nSat 9am-2pm — tools",
      weekend,
      hintFromHunt("Salem", "97301"),
    );

    expect(result.sales).toHaveLength(1);
    expect(result.geocoded).toBe(1);
    expect(result.missed).toEqual([]);
    expect(result.sales[0]?.lat).toBeCloseTo(44.9412, 3);
    expect(result.sales[0]?.address).toMatch(/TEST ST/i);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("reports a sale Census cannot place", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "no match" }), { status: 404 })),
    );

    const result = await parseUserSalesAsync(
      "Ghost Sale\n9999 Nowhere Rd\nSat 9am-2pm",
      weekend,
      hintFromHunt("Salem", "97301"),
    );

    expect(result.sales).toEqual([]);
    expect(result.missed).toEqual(["Ghost Sale"]);
  });
});
