import { describe, expect, it } from "vitest";
import { BankrollSchema } from "@/lib/validation/bankroll";
import { BetSchema, BetStatusSchema } from "@/lib/validation/bets";
import { OnboardingSchema } from "@/lib/validation/onboarding";

describe("BetSchema", () => {
  it("accepts a valid tracked bet", () => {
    const parsed = BetSchema.safeParse({
      sport: "NBA",
      eventLabel: "NYK @ BOS",
      market: "moneyline",
      selection: "BOS",
      sportsbook: "FanDuel",
      americanOdds: -110,
      stake: 25,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects zero american odds and non-positive stake", () => {
    expect(
      BetSchema.safeParse({
        sport: "NBA",
        eventLabel: "A @ B",
        market: "moneyline",
        selection: "A",
        sportsbook: "DK",
        americanOdds: 0,
        stake: 0,
      }).success,
    ).toBe(false);
  });

  it("parses bet statuses", () => {
    expect(BetStatusSchema.parse("won")).toBe("won");
    expect(() => BetStatusSchema.parse("cashout")).toThrow();
  });
});

describe("BankrollSchema", () => {
  it("caps stake and kelly fractions at 1", () => {
    expect(
      BankrollSchema.safeParse({
        startingBankroll: 1000,
        currentBankroll: 1000,
        monthlyBudget: 200,
        maxStakePercent: 1.5,
        dailyLossLimit: 50,
        weeklyLossLimit: 100,
        kellyFraction: 0.25,
      }).success,
    ).toBe(false);
  });
});

describe("OnboardingSchema", () => {
  it("requires legal age and responsible-use acceptance", () => {
    const base = {
      displayName: "Alex",
      country: "US",
      timezone: "America/New_York",
      favoriteSports: ["NBA"],
      preferredSportsbooks: [],
      experienceLevel: "beginner" as const,
      startingBankroll: 500,
      monthlyBudget: 100,
      isLegalAge: true as const,
      responsibleUseAccepted: true as const,
    };
    expect(OnboardingSchema.safeParse(base).success).toBe(true);
    expect(
      OnboardingSchema.safeParse({ ...base, isLegalAge: false }).success,
    ).toBe(false);
  });
});
