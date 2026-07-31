import type {
  AIProvider,
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

const REFUSAL_PATTERNS = [
  /match.?fix/i,
  /insider/i,
  /guaranteed/i,
  /underage/i,
  /bypass.*(geo|age|restriction)/i,
  /place.*(bet|wager).*for me/i,
];

export class MockAIProvider implements AIProvider {
  readonly name = "mock-ai";

  async chat(params: { messages: { role: string; content: string }[] }) {
    const last = params.messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
    if (REFUSAL_PATTERNS.some((p) => p.test(last))) {
      return {
        content:
          "I can't help with requests involving match fixing, insider information, guaranteed outcomes, underage gambling, or placing bets. EdgePilot AI is a research tool only. If you're feeling pressure to wager, consider setting a cool-off limit and visit responsible gambling resources.",
        citations: [],
        meta: createMeta(this.name, true),
      };
    }

    return {
      content: [
        "**Research summary (mock grounded response)**",
        "",
        "Based on available mock application data:",
        "- Tonight's sample slate includes NBA, MLB, and upcoming NFL/NHL events.",
        "- Odds are labeled as mock and may be stale; always check timestamps.",
        "- Model probabilities are estimates and can be wrong due to injuries, lineup changes, or market information not yet reflected in our data.",
        "",
        "**Factual vs interpretation:** Event times and quoted odds are factual records from the provider. Any edge or EV figure is an interpretation — not a prediction of a certain outcome.",
        "",
        "This is development mock output. Connect an AI API key for live grounded answers.",
      ].join("\n"),
      citations: ["mock-odds:evt-nba-1", "mock-odds:snapshot"],
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
