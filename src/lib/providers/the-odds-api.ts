import { decimalToAmerican, edge, expectedValue, impliedProbability, noVigProbabilities } from "@/lib/betting/odds";
import { fetchWithRetry } from "@/lib/http/fetch-retry";
import type { OddsProvider } from "@/lib/providers/odds-provider";
import { createMeta } from "@/lib/providers/types";
import type { EvOpportunity, OddsQuote, SportsEvent } from "@/types";

const BASE = "https://api.the-odds-api.com/v4";

/** App sport id → The Odds API sport key */
const SPORT_KEYS: Record<string, string> = {
  nba: "basketball_nba",
  nfl: "americanfootball_nfl",
  mlb: "baseball_mlb",
  nhl: "icehockey_nhl",
};

const MARKET_MAP: Record<string, OddsQuote["market"]> = {
  h2h: "moneyline",
  spreads: "spread",
  totals: "total",
};

type ApiEvent = {
  id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    last_update?: string;
    markets: Array<{
      key: string;
      last_update?: string;
      outcomes: Array<{ name: string; price: number; point?: number }>;
    }>;
  }>;
};

function appSportFromKey(sportKey: string): string {
  const entry = Object.entries(SPORT_KEYS).find(([, key]) => key === sportKey);
  return entry?.[0] ?? sportKey;
}

function toEvent(api: ApiEvent): SportsEvent {
  const sportId = appSportFromKey(api.sport_key);
  return {
    id: api.id,
    sportId,
    leagueId: sportId,
    homeTeamId: slug(api.home_team),
    awayTeamId: slug(api.away_team),
    homeTeamName: api.home_team,
    awayTeamName: api.away_team,
    startsAt: api.commence_time,
    venue: "TBD",
    status: "scheduled",
  };
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function flattenQuotes(events: ApiEvent[]): OddsQuote[] {
  const quotes: OddsQuote[] = [];
  for (const event of events) {
    for (const book of event.bookmakers ?? []) {
      for (const market of book.markets) {
        const marketType = MARKET_MAP[market.key];
        if (!marketType) continue;
        for (const outcome of market.outcomes) {
          if (outcome.price <= 1) continue;
          const updatedAt = market.last_update ?? book.last_update ?? new Date().toISOString();
          quotes.push({
            id: `${event.id}:${book.key}:${market.key}:${outcome.name}:${outcome.point ?? ""}`,
            eventId: event.id,
            market: marketType,
            selection: outcome.name,
            sportsbook: book.title,
            americanOdds: decimalToAmerican(outcome.price),
            decimalOdds: outcome.price,
            line: outcome.point ?? null,
            impliedProbability: impliedProbability(outcome.price),
            updatedAt,
          });
        }
      }
    }
  }
  return quotes;
}

export class TheOddsApiProvider implements OddsProvider {
  readonly name = "the-odds-api";

  constructor(
    private apiKey: string,
    private regions = process.env.ODDS_API_REGIONS ?? "us",
  ) {}

  private async fetchSportOdds(sportKey: string, markets: string[]): Promise<ApiEvent[]> {
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      regions: this.regions,
      markets: markets.join(","),
      oddsFormat: "decimal",
      dateFormat: "iso",
    });
    const url = `${BASE}/sports/${sportKey}/odds?${params.toString()}`;
    const response = await fetchWithRetry(url, { timeoutMs: 10_000, retries: 2 });
    if (!response.ok) {
      throw new Error(`The Odds API ${response.status}: ${await response.text().catch(() => "")}`);
    }
    return (await response.json()) as ApiEvent[];
  }

  private async load(params?: { sport?: string; markets?: string[] }): Promise<{
    events: SportsEvent[];
    quotes: OddsQuote[];
    fetchedAt: string;
  }> {
    const sports = params?.sport
      ? [SPORT_KEYS[params.sport.toLowerCase()]].filter(Boolean)
      : Object.values(SPORT_KEYS);
    if (sports.length === 0) {
      throw new Error(`Unsupported sport filter: ${params?.sport}`);
    }

    const marketKeys =
      params?.markets?.map((m) => {
        if (m === "moneyline") return "h2h";
        if (m === "spread") return "spreads";
        if (m === "total") return "totals";
        return m;
      }) ?? ["h2h", "spreads", "totals"];

    const batches = await Promise.all(
      sports.map((sportKey) => this.fetchSportOdds(sportKey, marketKeys)),
    );
    const apiEvents = batches.flat();
    const fetchedAt = new Date().toISOString();
    return {
      events: apiEvents.map(toEvent),
      quotes: flattenQuotes(apiEvents),
      fetchedAt,
    };
  }

  async getEvents(params?: { sport?: string }) {
    try {
      const { events, fetchedAt } = await this.load({ sport: params?.sport, markets: ["h2h"] });
      return { data: events, meta: createMeta(this.name, false, fetchedAt, 5) };
    } catch (error) {
      console.error("[the-odds-api:getEvents]", error);
      return { data: [], meta: { ...createMeta(this.name, false), isStale: true } };
    }
  }

  async getOdds(params: { eventId?: string; sport?: string; markets?: string[] }) {
    try {
      const { quotes, fetchedAt } = await this.load({
        sport: params.sport,
        markets: params.markets,
      });
      let data = quotes;
      if (params.eventId) data = data.filter((q) => q.eventId === params.eventId);
      return { data, meta: createMeta(this.name, false, fetchedAt, 5) };
    } catch (error) {
      console.error("[the-odds-api:getOdds]", error);
      return { data: [], meta: { ...createMeta(this.name, false), isStale: true } };
    }
  }

  async getEvOpportunities(params?: { sport?: string; minEdge?: number }) {
    try {
      const { events, quotes, fetchedAt } = await this.load({
        sport: params?.sport,
        markets: ["h2h"],
      });
      const minEdge = params?.minEdge ?? 0;
      const opportunities: EvOpportunity[] = [];

      for (const event of events) {
        const ml = quotes.filter((q) => q.eventId === event.id && q.market === "moneyline");
        const bySelection = new Map<string, OddsQuote[]>();
        for (const q of ml) {
          const list = bySelection.get(q.selection) ?? [];
          list.push(q);
          bySelection.set(q.selection, list);
        }
        const selections = [...bySelection.keys()];
        if (selections.length < 2) continue;

        const bestPerSelection = selections.map((selection) => {
          const list = bySelection.get(selection)!;
          return list.reduce((a, b) => (a.decimalOdds >= b.decimalOdds ? a : b));
        });

        let fair: number[];
        try {
          fair = noVigProbabilities(bestPerSelection.map((q) => q.decimalOdds));
        } catch {
          continue;
        }

        bestPerSelection.forEach((quote, idx) => {
          // Conservative: treat no-vig consensus as the model prior (not a proprietary model).
          const modelProbability = fair[idx]!;
          const edgeValue = edge(modelProbability, quote.impliedProbability);
          const ev = expectedValue(modelProbability, quote.decimalOdds);
          if (edgeValue < minEdge || ev <= 0) return;
          opportunities.push({
            id: `ev-${quote.id}`,
            eventId: event.id,
            eventLabel: `${event.awayTeamName} @ ${event.homeTeamName}`,
            market: "moneyline",
            selection: quote.selection,
            sportsbook: quote.sportsbook,
            americanOdds: quote.americanOdds,
            decimalOdds: quote.decimalOdds,
            modelProbability: Number(modelProbability.toFixed(4)),
            marketProbability: quote.impliedProbability,
            noVigProbability: Number(modelProbability.toFixed(4)),
            edge: Number(edgeValue.toFixed(4)),
            expectedValue: Number(ev.toFixed(4)),
            dataQuality: "medium",
            sampleSize: null,
            keyFactors: [
              "Best available moneyline vs no-vig consensus of best prices",
              "Consensus used as a prior — not a proprietary predictive model",
            ],
            riskWarnings: [
              "Live lines move; quotes may be stale by the time you check a book.",
              "No-vig consensus is not a true probability model.",
              "Books may limit or reject bets at the posted price.",
            ],
            whyMayBeWrong: [
              "Best prices may not be simultaneously available.",
              "Injury or lineup news may already be priced unevenly.",
              "Vig redistribution assumptions can misstate fair odds.",
            ],
            updatedAt: quote.updatedAt,
          });
        });
      }

      return { data: opportunities, meta: createMeta(this.name, false, fetchedAt, 5) };
    } catch (error) {
      console.error("[the-odds-api:getEvOpportunities]", error);
      return { data: [], meta: { ...createMeta(this.name, false), isStale: true } };
    }
  }
}
