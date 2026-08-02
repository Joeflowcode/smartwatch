import type {
  EmailProvider,
  InjuryProvider,
  SportsDataProvider,
  StatsProvider,
  WeatherProvider,
} from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";
import { mockEvents } from "@/lib/providers/mock-odds";

export class MockSportsDataProvider implements SportsDataProvider {
  readonly name = "mock-sports";

  async getSchedule(params?: { sport?: string; date?: string }) {
    let data = mockEvents;
    if (params?.sport) {
      data = data.filter((e) => e.sportId === params.sport?.toLowerCase());
    }
    return { data, meta: createMeta(this.name, true) };
  }

  async getInjuries(params: { eventId?: string; teamId?: string }) {
    const event = mockEvents.find((e) => e.id === params.eventId) ?? mockEvents[0];
    const data = [
      {
        id: "inj-1",
        playerName: "Example Forward",
        teamId: event.awayTeamId,
        status: "Questionable",
        description: "Mock ankle sprain — illustrative only.",
        updatedAt: new Date().toISOString(),
      },
    ];
    return { data, meta: createMeta(this.name, true) };
  }

  async getTeamStats(params: { teamId: string }) {
    return {
      data: {
        teamId: params.teamId,
        last10Wins: 6,
        last10Losses: 4,
        avgPointsFor: 112.4,
        avgPointsAgainst: 108.1,
        restDays: 1,
        note: "Mock statistics for development",
      },
      meta: createMeta(this.name, true),
    };
  }
}

export class MockInjuryProvider implements InjuryProvider {
  readonly name = "mock-injury";
  private sports = new MockSportsDataProvider();

  async getInjuries(params: { eventId?: string; teamId?: string }) {
    return this.sports.getInjuries(params);
  }
}

export class MockStatsProvider implements StatsProvider {
  readonly name = "mock-stats";
  private sports = new MockSportsDataProvider();

  async getTeamStats(teamId: string) {
    return this.sports.getTeamStats({ teamId });
  }
}

export class MockWeatherProvider implements WeatherProvider {
  readonly name = "mock-weather";

  async getWeather(params: { venue: string; startsAt: string }) {
    const outdoor = /stadium/i.test(params.venue);
    return {
      data: outdoor
        ? { temperatureF: 72, condition: "Clear (mock)", windMph: 8 }
        : null,
      meta: createMeta(this.name, true),
    };
  }
}

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock-email";

  async send(params: { to: string; subject: string; html: string }) {
    console.info("[mock-email]", params.to, params.subject);
    return { id: `mock-${Date.now()}`, meta: createMeta(this.name, true) };
  }
}
