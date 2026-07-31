import { z } from "zod";

export const OddsFormatSchema = z.enum(["american", "decimal", "fractional"]);

export const ProviderMetaSchema = z.object({
  provider: z.string(),
  fetchedAt: z.string(),
  isStale: z.boolean(),
  isMock: z.boolean(),
});

export type ProviderMeta = z.infer<typeof ProviderMetaSchema>;

export const SportSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  sportId: z.string(),
});

export const EventSchema = z.object({
  id: z.string(),
  sportId: z.string(),
  leagueId: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeTeamName: z.string(),
  awayTeamName: z.string(),
  startsAt: z.string(),
  venue: z.string().optional(),
  status: z.enum(["scheduled", "live", "final", "postponed", "canceled"]),
});

export type SportsEvent = z.infer<typeof EventSchema>;

export const MarketTypeSchema = z.enum(["moneyline", "spread", "total", "player_prop"]);

export const OddsQuoteSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  market: MarketTypeSchema,
  selection: z.string(),
  sportsbook: z.string(),
  americanOdds: z.number(),
  decimalOdds: z.number(),
  line: z.number().nullable(),
  impliedProbability: z.number(),
  updatedAt: z.string(),
});

export type OddsQuote = z.infer<typeof OddsQuoteSchema>;

export const InjurySchema = z.object({
  id: z.string(),
  playerName: z.string(),
  teamId: z.string(),
  status: z.string(),
  description: z.string(),
  updatedAt: z.string(),
});

export const EvOpportunitySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventLabel: z.string(),
  market: MarketTypeSchema,
  selection: z.string(),
  sportsbook: z.string(),
  americanOdds: z.number(),
  decimalOdds: z.number(),
  modelProbability: z.number(),
  marketProbability: z.number(),
  noVigProbability: z.number(),
  edge: z.number(),
  expectedValue: z.number(),
  dataQuality: z.enum(["low", "medium", "high"]),
  sampleSize: z.number().nullable(),
  keyFactors: z.array(z.string()),
  riskWarnings: z.array(z.string()),
  whyMayBeWrong: z.array(z.string()),
  updatedAt: z.string(),
});

export type EvOpportunity = z.infer<typeof EvOpportunitySchema>;

export const PlanIdSchema = z.enum(["free", "pro", "elite"]);
