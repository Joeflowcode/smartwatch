import { describe, expect, it } from "vitest";
import {
  betsToCsv,
  closingLineValueAmericanPoints,
  closingLineValueProbability,
} from "@/lib/betting/clv";
import { americanToDecimal } from "@/lib/betting/odds";
import { findDemoArbitrage } from "@/lib/providers/demo-arbitrage";

describe("closing line value", () => {
  it("is positive when bet price is better than close", () => {
    // Bet +150, close +120 → you got more juice as dog
    const clv = closingLineValueProbability(
      americanToDecimal(150),
      americanToDecimal(120),
    );
    expect(clv).toBeGreaterThan(0);
  });

  it("is negative when bet price is worse than close", () => {
    const clv = closingLineValueProbability(
      americanToDecimal(-120),
      americanToDecimal(-110),
    );
    expect(clv).toBeLessThan(0);
  });

  it("rejects invalid decimal odds", () => {
    expect(() => closingLineValueProbability(1, 2)).toThrow(/greater than 1/i);
  });

  it("reports american point difference", () => {
    expect(closingLineValueAmericanPoints(-110, -120)).toBe(10);
  });
});

describe("csv export", () => {
  it("escapes commas and includes header", () => {
    const csv = betsToCsv([
      {
        sport: "NBA",
        event: "Away @ Home, tip",
        market: "moneyline",
        selection: "Home",
        sportsbook: "DraftKings",
        americanOdds: -110,
        stake: 25,
        status: "won",
        notes: 'said "value"',
      },
    ]);
    expect(csv.startsWith("sport,event,")).toBe(true);
    expect(csv).toContain('"Away @ Home, tip"');
    expect(csv).toContain('""value""');
  });

  it("includes CLV when closing line is present", () => {
    const csv = betsToCsv([
      {
        sport: "NBA",
        event: "A @ B",
        market: "moneyline",
        selection: "B",
        sportsbook: "FanDuel",
        americanOdds: 150,
        stake: 10,
        status: "open",
        closingLineAmerican: 120,
      },
    ]);
    expect(csv).toContain("120");
    const clvCell = csv.trim().split("\n")[1]?.split(",").at(-1);
    expect(Number(clvCell)).toBeGreaterThan(0);
  });
});

describe("demo arbitrage finder", () => {
  it("returns zero or more opportunities with warnings", () => {
    const ops = findDemoArbitrage();
    expect(Array.isArray(ops)).toBe(true);
    for (const op of ops) {
      expect(op.isArbitrage).toBe(true);
      expect(op.warnings.length).toBeGreaterThan(0);
      expect(op.legs.length).toBeGreaterThanOrEqual(2);
    }
  });
});
