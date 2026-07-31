import type { ProviderMeta, SportsEvent } from "@/types";
import type { z } from "zod";
import { InjurySchema } from "@/types";

type Injury = z.infer<typeof InjurySchema>;

export interface SportsDataProvider {
  readonly name: string;
  getSchedule(params?: {
    sport?: string;
    date?: string;
  }): Promise<{ data: SportsEvent[]; meta: ProviderMeta }>;
  getInjuries(params: {
    eventId?: string;
    teamId?: string;
  }): Promise<{ data: Injury[]; meta: ProviderMeta }>;
  getTeamStats(params: {
    teamId: string;
  }): Promise<{ data: Record<string, number | string>; meta: ProviderMeta }>;
}

export interface InjuryProvider {
  readonly name: string;
  getInjuries(params: {
    eventId?: string;
    teamId?: string;
  }): Promise<{ data: Injury[]; meta: ProviderMeta }>;
}

export interface StatsProvider {
  readonly name: string;
  getTeamStats(teamId: string): Promise<{
    data: Record<string, number | string>;
    meta: ProviderMeta;
  }>;
}

export interface WeatherProvider {
  readonly name: string;
  getWeather(params: {
    venue: string;
    startsAt: string;
  }): Promise<{
    data: { temperatureF: number; condition: string; windMph: number } | null;
    meta: ProviderMeta;
  }>;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  readonly name: string;
  chat(params: {
    messages: AIMessage[];
    tools?: unknown[];
  }): Promise<{ content: string; citations: string[]; meta: ProviderMeta }>;
}

export interface EmailProvider {
  readonly name: string;
  send(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ id: string; meta: ProviderMeta }>;
}

export function createMeta(
  provider: string,
  isMock: boolean,
  fetchedAt = new Date().toISOString(),
  staleMinutes = 15,
): ProviderMeta {
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  return {
    provider,
    fetchedAt,
    isStale: ageMs > staleMinutes * 60 * 1000,
    isMock,
  };
}
