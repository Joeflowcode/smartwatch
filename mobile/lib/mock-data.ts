export type Sport = "NBA" | "NFL" | "MLB" | "NHL";

export interface SportsEvent {
  id: string;
  sport: Sport;
  home: string;
  away: string;
  startsAt: string;
  venue: string;
}

export interface OddsQuote {
  id: string;
  eventId: string;
  market: "moneyline" | "spread" | "total";
  selection: string;
  sportsbook: string;
  american: number;
  line?: number | null;
}

export interface EvRow {
  id: string;
  eventLabel: string;
  sport: Sport;
  selection: string;
  sportsbook: string;
  american: number;
  edge: number;
  ev: number;
  modelProb: number;
}

export interface BetRow {
  id: string;
  label: string;
  stake: number;
  odds: number;
  status: "open" | "won" | "lost" | "push";
  placedAt: string;
}

function tonight(h = 19, m = 30) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function tomorrow(h = 20) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

export const EVENTS: SportsEvent[] = [
  {
    id: "evt-nba-1",
    sport: "NBA",
    home: "Boston Celtics",
    away: "New York Knicks",
    startsAt: tonight(19, 30),
    venue: "TD Garden",
  },
  {
    id: "evt-nba-2",
    sport: "NBA",
    home: "Denver Nuggets",
    away: "Phoenix Suns",
    startsAt: tonight(22, 0),
    venue: "Ball Arena",
  },
  {
    id: "evt-nfl-1",
    sport: "NFL",
    home: "Kansas City Chiefs",
    away: "Buffalo Bills",
    startsAt: tomorrow(20),
    venue: "Arrowhead Stadium",
  },
  {
    id: "evt-mlb-1",
    sport: "MLB",
    home: "Los Angeles Dodgers",
    away: "San Diego Padres",
    startsAt: tonight(19, 10),
    venue: "Dodger Stadium",
  },
  {
    id: "evt-nhl-1",
    sport: "NHL",
    home: "Edmonton Oilers",
    away: "Colorado Avalanche",
    startsAt: tomorrow(19),
    venue: "Rogers Place",
  },
];

export const ODDS: OddsQuote[] = [
  { id: "o1", eventId: "evt-nba-1", market: "moneyline", selection: "Boston Celtics", sportsbook: "DraftKings", american: -145 },
  { id: "o2", eventId: "evt-nba-1", market: "moneyline", selection: "New York Knicks", sportsbook: "DraftKings", american: 125 },
  { id: "o3", eventId: "evt-nba-1", market: "moneyline", selection: "Boston Celtics", sportsbook: "FanDuel", american: -138 },
  { id: "o4", eventId: "evt-nba-1", market: "moneyline", selection: "New York Knicks", sportsbook: "FanDuel", american: 118 },
  { id: "o5", eventId: "evt-nba-1", market: "spread", selection: "Boston Celtics", sportsbook: "DraftKings", american: -110, line: -4.5 },
  { id: "o6", eventId: "evt-nba-1", market: "spread", selection: "New York Knicks", sportsbook: "DraftKings", american: -110, line: 4.5 },
  { id: "o7", eventId: "evt-nfl-1", market: "moneyline", selection: "Kansas City Chiefs", sportsbook: "DraftKings", american: -120 },
  { id: "o8", eventId: "evt-nfl-1", market: "moneyline", selection: "Buffalo Bills", sportsbook: "DraftKings", american: 100 },
  { id: "o9", eventId: "evt-mlb-1", market: "moneyline", selection: "Los Angeles Dodgers", sportsbook: "FanDuel", american: -155 },
  { id: "o10", eventId: "evt-mlb-1", market: "moneyline", selection: "San Diego Padres", sportsbook: "FanDuel", american: 135 },
  { id: "o11", eventId: "evt-nhl-1", market: "moneyline", selection: "Edmonton Oilers", sportsbook: "BetMGM", american: -130 },
  { id: "o12", eventId: "evt-nhl-1", market: "moneyline", selection: "Colorado Avalanche", sportsbook: "BetMGM", american: 110 },
  { id: "o13", eventId: "evt-nba-2", market: "moneyline", selection: "Denver Nuggets", sportsbook: "DraftKings", american: -125 },
  { id: "o14", eventId: "evt-nba-2", market: "moneyline", selection: "Phoenix Suns", sportsbook: "DraftKings", american: 105 },
];

export const EV_ROWS: EvRow[] = [
  {
    id: "ev1",
    eventLabel: "NYK @ BOS",
    sport: "NBA",
    selection: "New York Knicks ML",
    sportsbook: "DraftKings",
    american: 125,
    edge: 0.034,
    ev: 0.041,
    modelProb: 0.48,
  },
  {
    id: "ev2",
    eventLabel: "BUF @ KC",
    sport: "NFL",
    selection: "Buffalo Bills ML",
    sportsbook: "DraftKings",
    american: 100,
    edge: 0.028,
    ev: 0.032,
    modelProb: 0.515,
  },
  {
    id: "ev3",
    eventLabel: "SD @ LAD",
    sport: "MLB",
    selection: "San Diego Padres ML",
    sportsbook: "FanDuel",
    american: 135,
    edge: 0.021,
    ev: 0.025,
    modelProb: 0.44,
  },
  {
    id: "ev4",
    eventLabel: "COL @ EDM",
    sport: "NHL",
    selection: "Colorado Avalanche ML",
    sportsbook: "BetMGM",
    american: 110,
    edge: 0.018,
    ev: 0.02,
    modelProb: 0.49,
  },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(14, 0, 0, 0);
  return d.toISOString();
}

export const BETS: BetRow[] = [
  {
    id: "b1",
    label: "Celtics -4.5",
    stake: 50,
    odds: -110,
    status: "open",
    placedAt: tonight(12),
  },
  {
    id: "b2",
    label: "Dodgers ML",
    stake: 40,
    odds: -155,
    status: "won",
    placedAt: daysAgo(1),
  },
  {
    id: "b3",
    label: "Over 221.5",
    stake: 25,
    odds: -108,
    status: "lost",
    placedAt: daysAgo(2),
  },
];

export const BANKROLL = {
  current: 2500,
  monthlyBudget: 400,
  maxStakePercent: 0.02,
  dailyLossLimitPercent: 0.05,
  weeklyLossLimitPercent: 0.1,
  kellyFraction: 0.25,
};

export const SUGGESTED_PROMPTS = [
  "Summarize tonight’s NBA slate",
  "Explain the highest EV play",
  "Size a stake for 2% bankroll risk",
  "What does +125 imply vs my model?",
];

export function formatAmerican(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

export function formatPercent(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Local mock AI — mirrors web safety tone when API is unavailable. */
export function mockAiReply(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/guarantee|lock|sure thing|can.?t lose/.test(lower)) {
    return "I can’t promise outcomes. EdgePilot surfaces estimates and uncertainty — not locks. Use bankroll limits and never wager money you can’t afford to lose.";
  }
  if (/ev|expected value|scanner/.test(lower)) {
    const top = EV_ROWS[0];
    return `Highest illustrative EV right now: ${top.selection} at ${top.sportsbook} (${formatAmerican(top.american)}), model edge ~${formatPercent(top.edge)}. This is mock research data — not a bet recommendation. Cross-check live books before acting.`;
  }
  if (/bankroll|stake|kelly|size/.test(lower)) {
    const max = BANKROLL.current * BANKROLL.maxStakePercent;
    return `With a ${formatMoney(BANKROLL.current)} bankroll and ${formatPercent(BANKROLL.maxStakePercent)} max stake, cap a single play around ${formatMoney(max)}. Fractional Kelly (${BANKROLL.kellyFraction}) is even more conservative when edge is uncertain.`;
  }
  if (/nba|slate|tonight/.test(lower)) {
    const nba = EVENTS.filter((e) => e.sport === "NBA");
    return `Tonight’s mock NBA slate:\n${nba.map((e) => `• ${e.away} @ ${e.home} — ${formatKickoff(e.startsAt)}`).join("\n")}\nOdds and EV are estimates and may be delayed.`;
  }
  return `I can help with slate summaries, EV math, and bankroll sizing using available research data. Ask about a specific game or paste an American price. Reminder: EdgePilot is analytics only — not a sportsbook.`;
}
