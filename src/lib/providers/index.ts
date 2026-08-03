import type { OddsProvider } from "@/lib/providers/odds-provider";
import { MockOddsProvider } from "@/lib/providers/mock-odds";
import { MockAIProvider } from "@/lib/providers/mock-ai";
import { OpenAIProvider } from "@/lib/providers/openai-ai";
import { ResendEmailProvider } from "@/lib/providers/resend-email";
import {
  MockEmailProvider,
  MockInjuryProvider,
  MockSportsDataProvider,
  MockStatsProvider,
  MockWeatherProvider,
} from "@/lib/providers/mock-sports";
import { TheOddsApiProvider } from "@/lib/providers/the-odds-api";
import type {
  AIProvider,
  EmailProvider,
  InjuryProvider,
  SportsDataProvider,
  StatsProvider,
  WeatherProvider,
} from "@/lib/providers/types";

export { TheOddsApiProvider };

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
    return new OpenAIProvider(process.env.OPENAI_API_KEY);
  }
  return new MockAIProvider();
}

export function createEmailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailProvider(process.env.RESEND_API_KEY);
  }
  return new MockEmailProvider();
}
