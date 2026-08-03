import { describe, expect, it } from "vitest";
import {
  americanToDecimal,
  decimalToAmerican,
  decimalToFractional,
  detectArbitrage,
  edge,
  expectedValue,
  formatAmerican,
  fractionalKelly,
  fractionalToDecimal,
  impliedProbability,
  kellyFraction,
  noVigProbabilities,
  parseAmerican,
  payout,
  profit,
  recommendedStake,
  toDecimal,
} from "@/lib/betting/odds";

describe("odds conversion", () => {
  it("converts American to decimal", () => {
    expect(americanToDecimal(-110)).toBeCloseTo(1.9091, 3);
    expect(americanToDecimal(150)).toBeCloseTo(2.5, 5);
  });

  it("rejects zero American odds", () => {
    expect(() => americanToDecimal(0)).toThrow(/zero/i);
  });

  it("converts decimal to American", () => {
    expect(decimalToAmerican(2.5)).toBe(150);
    expect(decimalToAmerican(1.9090909)).toBe(-110);
  });

  it("converts fractional to decimal", () => {
    expect(fractionalToDecimal(5, 2)).toBe(3.5);
  });

  it("converts decimal to fractional", () => {
    const { numerator, denominator } = decimalToFractional(2.5);
    expect(numerator / denominator).toBeCloseTo(1.5, 5);
  });

  it("parses and formats American odds", () => {
    expect(parseAmerican("+150")).toBe(150);
    expect(parseAmerican("-110")).toBe(-110);
    expect(formatAmerican(150)).toBe("+150");
    expect(formatAmerican(-110)).toBe("-110");
    expect(() => parseAmerican("0")).toThrow();
  });

  it("normalizes via toDecimal", () => {
    expect(toDecimal(-110, "american")).toBeCloseTo(1.9091, 3);
    expect(toDecimal(2.2, "decimal")).toBe(2.2);
    expect(() => toDecimal(5, "fractional")).toThrow(/fractionalToDecimal/i);
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

  it("returns zero stake for empty bankroll or no edge", () => {
    expect(recommendedStake(0, 0.6, 2.2)).toBe(0);
    expect(kellyFraction(0.4, 2.0)).toBe(0);
  });

  it("computes payout and profit", () => {
    expect(payout(100, 2.5)).toBe(250);
    expect(profit(100, 2.5)).toBe(150);
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

  it("requires at least two legs", () => {
    expect(() =>
      detectArbitrage([{ outcome: "A", decimalOdds: 2.1, sportsbook: "Book1" }]),
    ).toThrow(/two legs/i);
  });
});
