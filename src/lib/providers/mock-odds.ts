import {
  americanToDecimal,
  edge,
  expectedValue,
  impliedProbability,
  noVigProbabilities,
} from "@/lib/betting/odds";
import type { OddsProvider } from "@/lib/providers/odds-provider";
import { createMeta } from "@/lib/providers/types";
import type { EvOpportunity, OddsQuote, SportsEvent } from "@/types";

const NOW = new Date();
const tonight = new Date(NOW);
tonight.setHours(19, 30, 0, 0);
const tomorrow = new Date(NOW);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(20, 0, 0, 0);

const laterTonight = new Date(NOW);
laterTonight.setHours(22, 0, 0, 0);

const EVENTS: SportsEvent[] = [
  {
    id: "evt-nba-1",
    sportId: "nba",
    leagueId: "nba",
    homeTeamId: "bos",
    awayTeamId: "nyk",
    homeTeamName: "Boston Celtics",
    awayTeamName: "New York Knicks",
    startsAt: tonight.toISOString(),
    venue: "TD Garden",
    status: "scheduled",
  },
  {
    id: "evt-nba-2",
    sportId: "nba",
    leagueId: "nba",
    homeTeamId: "den",
    awayTeamId: "phx",
    homeTeamName: "Denver Nuggets",
    awayTeamName: "Phoenix Suns",
    startsAt: laterTonight.toISOString(),
    venue: "Ball Arena",
    status: "scheduled",
  },
  {
    id: "evt-nfl-1",
    sportId: "nfl",
    leagueId: "nfl",
    homeTeamId: "kc",
    awayTeamId: "buf",
    homeTeamName: "Kansas City Chiefs",
    awayTeamName: "Buffalo Bills",
    startsAt: tomorrow.toISOString(),
    venue: "Arrowhead Stadium",
    status: "scheduled",
  },
  {
    id: "evt-mlb-1",
    sportId: "mlb",
    leagueId: "mlb",
    homeTeamId: "lad",
    awayTeamId: "sd",
    homeTeamName: "Los Angeles Dodgers",
    awayTeamName: "San Diego Padres",
    startsAt: tonight.toISOString(),
    venue: "Dodger Stadium",
    status: "scheduled",
  },
  {
    id: "evt-mlb-2",
    sportId: "mlb",
    leagueId: "mlb",
    homeTeamId: "nyy",
    awayTeamId: "bosmlb",
    homeTeamName: "New York Yankees",
    awayTeamName: "Boston Red Sox",
    startsAt: laterTonight.toISOString(),
    venue: "Yankee Stadium",
    status: "scheduled",
  },
  {
    id: "evt-nhl-1",
    sportId: "nhl",
    leagueId: "nhl",
    homeTeamId: "edm",
    awayTeamId: "col",
    homeTeamName: "Edmonton Oilers",
    awayTeamName: "Colorado Avalanche",
    startsAt: tomorrow.toISOString(),
    venue: "Rogers Place",
    status: "scheduled",
  },
];

function quote(
  id: string,
  eventId: string,
  market: OddsQuote["market"],
  selection: string,
  sportsbook: string,
  american: number,
  line: number | null = null,
  minutesAgo = 5,
): OddsQuote {
  const decimal = americanToDecimal(american);
  const updatedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  return {
    id,
    eventId,
    market,
    selection,
    sportsbook,
    americanOdds: american,
    decimalOdds: Number(decimal.toFixed(4)),
    line,
    impliedProbability: Number(impliedProbability(decimal).toFixed(4)),
    updatedAt,
  };
}

const ODDS: OddsQuote[] = [
  quote("o1", "evt-nba-1", "moneyline", "Boston Celtics", "DraftKings", -145),
  quote("o2", "evt-nba-1", "moneyline", "New York Knicks", "DraftKings", +125),
  quote("o3", "evt-nba-1", "moneyline", "Boston Celtics", "FanDuel", -138),
  quote("o4", "evt-nba-1", "moneyline", "New York Knicks", "FanDuel", +118),
  quote("o5", "evt-nba-1", "moneyline", "Boston Celtics", "BetMGM", -150),
  quote("o6", "evt-nba-1", "moneyline", "New York Knicks", "BetMGM", +130),
  quote("o7", "evt-nba-1", "spread", "Boston Celtics", "DraftKings", -110, -4.5),
  quote("o8", "evt-nba-1", "spread", "New York Knicks", "DraftKings", -110, 4.5),
  quote("o9", "evt-nba-1", "total", "Over", "FanDuel", -108, 221.5),
  quote("o10", "evt-nba-1", "total", "Under", "FanDuel", -112, 221.5),
  quote("o11", "evt-nfl-1", "moneyline", "Kansas City Chiefs", "DraftKings", -120),
  quote("o12", "evt-nfl-1", "moneyline", "Buffalo Bills", "DraftKings", +100),
  quote("o13", "evt-nfl-1", "moneyline", "Kansas City Chiefs", "FanDuel", -115),
  quote("o14", "evt-nfl-1", "moneyline", "Buffalo Bills", "FanDuel", -105),
  quote("o15", "evt-mlb-1", "moneyline", "Los Angeles Dodgers", "DraftKings", -155),
  quote("o16", "evt-mlb-1", "moneyline", "San Diego Padres", "DraftKings", +135),
  quote("o17", "evt-nhl-1", "moneyline", "Edmonton Oilers", "BetMGM", -130),
  quote("o18", "evt-nhl-1", "moneyline", "Colorado Avalanche", "BetMGM", +110),
  quote("o19", "evt-nba-2", "moneyline", "Denver Nuggets", "DraftKings", -125, null, 8),
  quote("o20", "evt-nba-2", "moneyline", "Phoenix Suns", "DraftKings", +105, null, 8),
  quote("o21", "evt-nba-2", "moneyline", "Denver Nuggets", "FanDuel", -118, null, 12),
  quote("o22", "evt-nba-2", "moneyline", "Phoenix Suns", "FanDuel", -102, null, 12),
  quote("o23", "evt-nba-2", "spread", "Denver Nuggets", "BetMGM", -110, -2.5, 15),
  quote("o24", "evt-nba-2", "spread", "Phoenix Suns", "BetMGM", -110, 2.5, 15),
  quote("o25", "evt-mlb-2", "moneyline", "New York Yankees", "FanDuel", -140, null, 20),
  quote("o26", "evt-mlb-2", "moneyline", "Boston Red Sox", "FanDuel", +120, null, 20),
  quote("o27", "evt-mlb-2", "moneyline", "New York Yankees", "DraftKings", -148, null, 25),
  quote("o28", "evt-mlb-2", "moneyline", "Boston Red Sox", "DraftKings", +128, null, 25),
  quote("o29", "evt-nfl-1", "spread", "Kansas City Chiefs", "BetMGM", -108, -1.5, 30),
  quote("o30", "evt-nfl-1", "spread", "Buffalo Bills", "BetMGM", -112, 1.5, 30),
  quote("o31", "evt-nhl-1", "total", "Over", "DraftKings", -115, 6.5, 18),
  quote("o32", "evt-nhl-1", "total", "Under", "DraftKings", -105, 6.5, 18),
];

function buildEv(): EvOpportunity[] {
  const opportunities: EvOpportunity[] = [];

  for (const event of EVENTS) {
    const homeOdds = ODDS.filter(
      (o) =>
        o.eventId === event.id && o.market === "moneyline" && o.selection === event.homeTeamName,
    );
    const awayOdds = ODDS.filter(
      (o) =>
        o.eventId === event.id && o.market === "moneyline" && o.selection === event.awayTeamName,
    );
    if (homeOdds.length === 0 || awayOdds.length === 0) continue;

    const bestHome = homeOdds.reduce((a, b) => (a.decimalOdds > b.decimalOdds ? a : b));
    const bestAway = awayOdds.reduce((a, b) => (a.decimalOdds > b.decimalOdds ? a : b));
    const [noVigHome, noVigAway] = noVigProbabilities([
      bestHome.decimalOdds,
      bestAway.decimalOdds,
    ]);

    // Small illustrative lean — mock only.
    const modelHome = Math.min(0.72, noVigHome + 0.025);
    const modelAway = 1 - modelHome;

    const make = (
      selection: string,
      quoteRow: OddsQuote,
      modelP: number,
      noVigP: number,
    ): EvOpportunity => {
      const marketP = quoteRow.impliedProbability;
      return {
        id: `ev-${quoteRow.id}`,
        eventId: event.id,
        eventLabel: `${event.awayTeamName} @ ${event.homeTeamName}`,
        market: "moneyline",
        selection,
        sportsbook: quoteRow.sportsbook,
        americanOdds: quoteRow.americanOdds,
        decimalOdds: quoteRow.decimalOdds,
        modelProbability: Number(modelP.toFixed(4)),
        marketProbability: marketP,
        noVigProbability: Number(noVigP.toFixed(4)),
        edge: Number(edge(modelP, marketP).toFixed(4)),
        expectedValue: Number(expectedValue(modelP, quoteRow.decimalOdds).toFixed(4)),
        dataQuality: "medium",
        sampleSize: 42,
        keyFactors: [
          "Rest advantage (mock)",
          "Home court historical edge (small sample caution)",
          "Recent form vs opposing pace (mock)",
        ],
        riskWarnings: [
          "Model probability is an estimate, not a certainty.",
          "Mock data — not for real wagering decisions.",
          "Injury news can invalidate pregame estimates quickly.",
        ],
        whyMayBeWrong: [
          "Small recent sample may overstate form.",
          "Market may price information unavailable to the model.",
          "Closing line may move against this quote.",
        ],
        updatedAt: quoteRow.updatedAt,
      };
    };

    opportunities.push(
      make(event.homeTeamName, bestHome, modelHome, noVigHome),
      make(event.awayTeamName, bestAway, modelAway, noVigAway),
    );
  }

  return opportunities.filter((o) => o.expectedValue > 0);
}

export class MockOddsProvider implements OddsProvider {
  readonly name = "mock-odds";

  async getEvents(params?: { sport?: string; date?: string }) {
    let data = EVENTS;
    if (params?.sport) {
      const sport = params.sport.toLowerCase();
      data = data.filter((e) => e.sportId === sport || e.leagueId === sport);
    }
    return { data, meta: createMeta(this.name, true) };
  }

  async getOdds(params: { eventId?: string; sport?: string; markets?: string[] }) {
    let data = ODDS;
    if (params.eventId) {
      data = data.filter((o) => o.eventId === params.eventId);
    }
    if (params.sport) {
      const eventIds = new Set(
        EVENTS.filter((e) => e.sportId === params.sport?.toLowerCase()).map((e) => e.id),
      );
      data = data.filter((o) => eventIds.has(o.eventId));
    }
    if (params.markets?.length) {
      data = data.filter((o) => params.markets?.includes(o.market));
    }
    return { data, meta: createMeta(this.name, true) };
  }

  async getEvOpportunities(params?: { sport?: string; minEdge?: number }) {
    let data = buildEv();
    if (params?.minEdge != null) {
      data = data.filter((o) => o.edge >= params.minEdge!);
    }
    if (params?.sport) {
      const eventIds = new Set(
        EVENTS.filter((e) => e.sportId === params.sport?.toLowerCase()).map((e) => e.id),
      );
      data = data.filter((o) => eventIds.has(o.eventId));
    }
    return { data, meta: createMeta(this.name, true) };
  }
}

export const mockEvents = EVENTS;
export const mockOdds = ODDS;
