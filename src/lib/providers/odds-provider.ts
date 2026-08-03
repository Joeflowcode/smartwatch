import type { EvOpportunity, OddsQuote, ProviderMeta, SportsEvent } from "@/types";

export interface OddsProvider {
  readonly name: string;
  getEvents(params?: {
    sport?: string;
    date?: string;
  }): Promise<{ data: SportsEvent[]; meta: ProviderMeta }>;
  getOdds(params: {
    eventId?: string;
    sport?: string;
    markets?: string[];
  }): Promise<{ data: OddsQuote[]; meta: ProviderMeta }>;
  getEvOpportunities(params?: {
    sport?: string;
    minEdge?: number;
  }): Promise<{ data: EvOpportunity[]; meta: ProviderMeta }>;
}
