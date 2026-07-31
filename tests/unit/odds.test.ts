import { describe, expect, it } from "vitest";
import {
  americanToDecimal,
  decimalToAmerican,
  detectArbitrage,
  edge,
  expectedValue,
  fractionalKelly,
  fractionalToDecimal,
  impliedProbability,
  kellyFraction,
  noVigProbabilities,
  recommendedStake,
} from "@/lib/betting/odds";

describe("odds conversion", () => {
  it("converts American to decimal", () => {
    expect(americanToDecimal(-110)).toBeCloseTo(1.9091, 3);
    expect(americanToDecimal(150)).toBeCloseTo(2.5, 5);
  });

  it("converts decimal to American", () => {
    expect(decimalToAmerican(2.5)).toBe(150);
    expect(decimalToAmerican(1.9090909)).toBe(-110);
  });

  it("converts fractional to decimal", () => {
    expect(fractionalToDecimal(5, 2)).toBe(3.5);
  });
});

describe("implied probability and no-vig", () => {
  it("computes implied probability", () => {
    expect(impliedProbability(2)).toBe(0.5);
  });

  it("removes vig from two-way market", () => {
    const probs = noVigProbabilities([americanToDecimal(-110), americanToDecimal(-110)]);
    expect(probs[0] + probs[1]).toBeCloseTo(1, 10);
    expect(probs[0]).toBeCloseTo(0.5, 5);
  });
});

describe("EV and Kelly", () => {
  it("computes positive EV", () => {
    const ev = expectedValue(0.55, 2.1);
    expect(ev).toBeGreaterThan(0);
  });

  it("computes edge", () => {
    expect(edge(0.55, 0.5)).toBeCloseTo(0.05, 10);
  });

  it("computes Kelly and fractional Kelly", () => {
    const full = kellyFraction(0.55, 2.0);
    expect(full).toBeCloseTo(0.1, 5);
    expect(fractionalKelly(0.55, 2.0, 0.25)).toBeCloseTo(0.025, 5);
  });

  it("caps recommended stake", () => {
    const stake = recommendedStake(1000, 0.6, 2.2, 0.25, 0.02);
    expect(stake).toBeLessThanOrEqual(20);
    expect(stake).toBeGreaterThan(0);
  });
});

describe("arbitrage detection", () => {
  it("detects arbitrage when total implied < 1", () => {
    const result = detectArbitrage([
      { outcome: "A", decimalOdds: 2.1, sportsbook: "Book1" },
      { outcome: "B", decimalOdds: 2.1, sportsbook: "Book2" },
    ]);
    expect(result.isArbitrage).toBe(true);
    expect(result.margin).toBeGreaterThan(0);
    expect(result.allocations).toHaveLength(2);
  });

  it("rejects non-arbitrage markets", () => {
    const result = detectArbitrage([
      { outcome: "A", decimalOdds: 1.9, sportsbook: "Book1" },
      { outcome: "B", decimalOdds: 1.9, sportsbook: "Book2" },
    ]);
    expect(result.isArbitrage).toBe(false);
  });
});
