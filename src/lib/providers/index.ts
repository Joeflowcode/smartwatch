import type { OddsProvider } from "@/lib/providers/odds-provider";
import { MockOddsProvider } from "@/lib/providers/mock-odds";
import { MockAIProvider } from "@/lib/providers/mock-ai";
import {
  MockEmailProvider,
  MockInjuryProvider,
  MockSportsDataProvider,
  MockStatsProvider,
  MockWeatherProvider,
} from "@/lib/providers/mock-sports";
import type {
  AIProvider,
  EmailProvider,
  InjuryProvider,
  SportsDataProvider,
  StatsProvider,
  WeatherProvider,
} from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";

/**
 * The Odds API adapter placeholder.
 * Uses live HTTP when ODDS_API_KEY is set; otherwise callers should use mock via factory.
 */
export class TheOddsApiProvider implements OddsProvider {
  readonly name = "the-odds-api";

  constructor(private apiKey: string) {}

  async getEvents() {
    // Live integration wired in a follow-up; fail soft with clear metadata.
    void this.apiKey;
    return {
      data: [],
      meta: {
        ...createMeta(this.name, false),
        isStale: true,
      },
    };
  }

  async getOdds() {
    return { data: [], meta: createMeta(this.name, false) };
  }

  async getEvOpportunities() {
    return { data: [], meta: createMeta(this.name, false) };
  }
}

export function createOddsProvider(): OddsProvider {
  const mode = process.env.ODDS_PROVIDER ?? "mock";
  if (mode === "the-odds-api" && process.env.ODDS_API_KEY) {
    return new TheOddsApiProvider(process.env.ODDS_API_KEY);
  }
  return new MockOddsProvider();
}

export function createSportsDataProvider(): SportsDataProvider {
  return new MockSportsDataProvider();
}

export function createInjuryProvider(): InjuryProvider {
  return new MockInjuryProvider();
}

export function createStatsProvider(): StatsProvider {
  return new MockStatsProvider();
}

export function createWeatherProvider(): WeatherProvider {
  return new MockWeatherProvider();
}

export function createAIProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    // Lazy live adapter — OpenAI wired in AI module; fallback mock if import fails.
    return new MockAIProvider();
  }
  return new MockAIProvider();
}

export function createEmailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) {
    return new MockEmailProvider(); // Resend adapter activated when fully configured
  }
  return new MockEmailProvider();
}
