import { describe, expect, it } from "vitest";
import { MockOddsProvider } from "@/lib/providers/mock-odds";
import { MockSportsDataProvider } from "@/lib/providers/mock-sports";
import { createOddsProvider, createAIProvider } from "@/lib/providers";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { isFeatureEnabled } from "@/config/features";

describe("mock odds provider", () => {
  it("returns multi-sport events with freshness metadata", async () => {
    const provider = new MockOddsProvider();
    const { data, meta } = await provider.getEvents();
    expect(data.length).toBeGreaterThanOrEqual(4);
    expect(new Set(data.map((e) => e.sportId)).size).toBeGreaterThanOrEqual(3);
    expect(meta.isMock).toBe(true);
    expect(meta.provider).toBe("mock-odds");
  });

  it("filters odds by sport and market", async () => {
    const provider = new MockOddsProvider();
    const { data } = await provider.getOdds({ sport: "nba", markets: ["moneyline"] });
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((o) => o.market === "moneyline")).toBe(true);
  });

  it("surfaces positive EV opportunities with warnings", async () => {
    const provider = new MockOddsProvider();
    const { data } = await provider.getEvOpportunities();
    for (const op of data) {
      expect(op.expectedValue).toBeGreaterThan(0);
      expect(op.riskWarnings.length).toBeGreaterThan(0);
      expect(op.whyMayBeWrong.length).toBeGreaterThan(0);
    }
  });
});

describe("sports data provider", () => {
  it("returns mock injuries and team stats", async () => {
    const sports = new MockSportsDataProvider();
    const injuries = await sports.getInjuries({ eventId: "evt-nba-1" });
    const stats = await sports.getTeamStats({ teamId: "bos" });
    expect(injuries.data[0]?.playerName).toBeTruthy();
    expect(stats.data.teamId).toBe("bos");
  });
});

describe("provider factories", () => {
  it("defaults to mock providers without keys", () => {
    expect(createOddsProvider().name).toContain("mock");
    expect(createAIProvider().name).toContain("mock");
  });
});

describe("utils", () => {
  it("formats currency and percent", () => {
    expect(formatCurrency(24.99)).toContain("24.99");
    expect(formatPercent(0.123)).toBe("12.3%");
  });

  it("merges class names", () => {
    expect(cn("a", false && "b", "c")).toContain("a");
    expect(cn("a", false && "b", "c")).toContain("c");
  });
});

describe("feature flags", () => {
  it("defaults arbitrageAlerts off", () => {
    expect(isFeatureEnabled("arbitrageAlerts")).toBe(false);
  });
});
