import { describe, expect, it } from "vitest";
import { PLANS, planHasFeature, TRIAL_DAYS } from "@/config/pricing";
import { DEFAULT_BANKROLL } from "@/config/site";
import {
  canUseFeature,
  getDemoSubscription,
  getPlanLimits,
} from "@/lib/stripe/entitlements";

describe("subscription entitlements config", () => {
  it("defines three plans with expected prices", () => {
    expect(PLANS.free.monthlyPriceUsd).toBe(0);
    expect(PLANS.pro.monthlyPriceUsd).toBe(24.99);
    expect(PLANS.elite.monthlyPriceUsd).toBe(79.99);
  });

  it("gates arbitrage to elite", () => {
    expect(planHasFeature("free", "arbitrageScanner")).toBe(false);
    expect(planHasFeature("pro", "arbitrageScanner")).toBe(false);
    expect(planHasFeature("elite", "arbitrageScanner")).toBe(true);
  });

  it("offers a beta trial window", () => {
    expect(TRIAL_DAYS).toBe(7);
  });
});

describe("runtime entitlements", () => {
  it("returns plan limits", () => {
    expect(getPlanLimits("pro").dailyAiQuestions).toBe(100);
    expect(getPlanLimits("elite").arbitrageScanner).toBe(true);
  });

  it("allows delayed EV scanner on free (limited ≠ none)", () => {
    expect(canUseFeature({ plan: "free", status: "active" }, "evScanner")).toBe(true);
  });

  it("falls back to free when past_due or canceled", () => {
    expect(
      canUseFeature({ plan: "elite", status: "past_due" }, "arbitrageScanner"),
    ).toBe(false);
    expect(
      canUseFeature({ plan: "pro", status: "canceled" }, "emailAlerts"),
    ).toBe(false);
    expect(canUseFeature({ plan: "pro", status: "active" }, "emailAlerts")).toBe(true);
  });

  it("provides a demo free subscription", () => {
    expect(getDemoSubscription()).toEqual({ plan: "free", status: "active" });
  });
});

describe("bankroll defaults", () => {
  it("uses conservative stake and kelly defaults", () => {
    expect(DEFAULT_BANKROLL.maxStakePercent).toBeLessThanOrEqual(0.02);
    expect(DEFAULT_BANKROLL.kellyFraction).toBeLessThanOrEqual(0.25);
  });
});
