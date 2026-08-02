export const APP_NAME = "EdgePilot AI";
export const APP_TAGLINE = "Research the edge. Control the risk.";
export const APP_DESCRIPTION =
  "AI-powered sports betting research assistant for comparing odds, estimating expected value, tracking bets, and managing bankroll limits. Analytics only — not a sportsbook.";

export const SUPPORTED_SPORTS = ["NBA", "NFL", "MLB", "NHL"] as const;
export type SupportedSport = (typeof SUPPORTED_SPORTS)[number];

export const FEATURE_FLAGS = {
  affiliateLinks: false,
  arbitrageAlerts: false,
  playerPropModeling: false,
  creatorWorkspaces: false,
  publicApi: false,
  advancedModelTraining: false,
  mobileNative: false,
  sportsbookConnections: false,
} as const;

export const DEFAULT_BANKROLL = {
  maxStakePercent: 0.02,
  dailyLossLimitPercent: 0.05,
  weeklyLossLimitPercent: 0.1,
  kellyFraction: 0.25,
} as const;

export const LEGAL_DISCLAIMER =
  "EdgePilot AI is an analytics and educational research tool. We do not accept wagers, custody funds, or operate as a sportsbook. Model outputs are informational estimates — not guarantees. Odds and statistics may be delayed or inaccurate. You must meet the legal gambling age in your jurisdiction and follow local law. Never wager money you cannot afford to lose.";
