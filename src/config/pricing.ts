export type PlanId = "free" | "pro" | "elite";

export interface PlanLimits {
  dailyAiQuestions: number;
  oddsComparison: "limited" | "full";
  evScanner: "none" | "delayed" | "full";
  betTracking: "limited" | "full";
  watchlists: boolean;
  emailAlerts: boolean;
  bankrollTools: boolean;
  arbitrageScanner: boolean;
  advancedFilters: boolean;
  exportReports: boolean;
  fasterRefresh: boolean;
  priorityBeta: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  highlighted?: boolean;
  limits: PlanLimits;
  features: string[];
}

/** Annual pricing = 10× monthly (2 months free). */
export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "Core research tools to evaluate EdgePilot AI.",
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    limits: {
      dailyAiQuestions: 5,
      oddsComparison: "limited",
      evScanner: "delayed",
      betTracking: "limited",
      watchlists: false,
      emailAlerts: false,
      bankrollTools: true,
      arbitrageScanner: false,
      advancedFilters: false,
      exportReports: false,
      fasterRefresh: false,
      priorityBeta: false,
    },
    features: [
      "Limited daily AI questions",
      "Limited odds comparison",
      "Basic game pages",
      "Limited bet tracking",
      "Delayed EV scanner access",
      "Responsible bankroll basics",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Full research workflow for serious recreational bettors.",
    monthlyPriceUsd: 24.99,
    annualPriceUsd: 249.9,
    highlighted: true,
    limits: {
      dailyAiQuestions: 100,
      oddsComparison: "full",
      evScanner: "full",
      betTracking: "full",
      watchlists: true,
      emailAlerts: true,
      bankrollTools: true,
      arbitrageScanner: false,
      advancedFilters: true,
      exportReports: false,
      fasterRefresh: false,
      priorityBeta: false,
    },
    features: [
      "100 AI questions / day",
      "Full odds comparison",
      "EV scanner",
      "Line-movement tracking",
      "Full bet-tracking analytics",
      "Watchlists & email alerts",
      "Bankroll tools",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite",
    description: "Higher limits and advanced scanners for power users.",
    monthlyPriceUsd: 79.99,
    annualPriceUsd: 799.9,
    limits: {
      dailyAiQuestions: 500,
      oddsComparison: "full",
      evScanner: "full",
      betTracking: "full",
      watchlists: true,
      emailAlerts: true,
      bankrollTools: true,
      arbitrageScanner: true,
      advancedFilters: true,
      exportReports: true,
      fasterRefresh: true,
      priorityBeta: true,
    },
    features: [
      "500 AI questions / day",
      "Arbitrage scanner",
      "Exportable reports",
      "Faster data refresh where supported",
      "Advanced analytics",
      "Priority beta features",
      "Creator workspace (flagged)",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "elite"];

export const TRIAL_DAYS = 7;

export const STRIPE_PRICE_ENV: Record<
  Exclude<PlanId, "free">,
  { monthly: string; annual: string }
> = {
  pro: {
    monthly: "STRIPE_PRICE_PRO_MONTHLY",
    annual: "STRIPE_PRICE_PRO_ANNUAL",
  },
  elite: {
    monthly: "STRIPE_PRICE_ELITE_MONTHLY",
    annual: "STRIPE_PRICE_ELITE_ANNUAL",
  },
};

export function getStripePriceId(
  plan: Exclude<PlanId, "free">,
  interval: "monthly" | "annual",
): string | undefined {
  const envKey = STRIPE_PRICE_ENV[plan][interval];
  return process.env[envKey];
}

export function planHasFeature(plan: PlanId, feature: keyof PlanLimits): boolean {
  const value = PLANS[plan].limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return value !== "none" && value !== "limited";
}
