import { MockOddsProvider } from "@/lib/providers/mock-odds";
import {
  americanToDecimal,
  expectedValue,
  formatAmerican,
  fractionalKelly,
  impliedProbability,
  noVigProbabilities,
  recommendedStake,
} from "@/lib/betting/odds";

export type ToolName = "get_slate" | "explain_probabilities" | "size_stake";

export const AI_TOOL_SPECS = [
  {
    type: "function" as const,
    function: {
      name: "get_slate",
      description: "List upcoming sample/live events with best moneyline quotes.",
      parameters: {
        type: "object",
        properties: {
          sport: { type: "string", description: "nba | nfl | mlb | nhl" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "explain_probabilities",
      description: "Explain market, no-vig, and model probability using a quote pair.",
      parameters: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "size_stake",
      description: "Compute conservative quarter-Kelly stake suggestion.",
      parameters: {
        type: "object",
        properties: {
          modelProbability: { type: "number" },
          americanOdds: { type: "number" },
          bankroll: { type: "number" },
        },
        required: ["modelProbability", "americanOdds", "bankroll"],
      },
    },
  },
];

export async function runAiTool(
  name: ToolName,
  args: Record<string, unknown>,
): Promise<{ content: string; citations: string[] }> {
  const odds = new MockOddsProvider();

  if (name === "get_slate") {
    const sport = typeof args.sport === "string" ? args.sport : undefined;
    const [{ data: events }, { data: quotes }] = await Promise.all([
      odds.getEvents({ sport }),
      odds.getOdds({ sport, markets: ["moneyline"] }),
    ]);
    const lines = events.map((e) => {
      const ml = quotes.filter((q) => q.eventId === e.id);
      const best = ml.sort((a, b) => b.decimalOdds - a.decimalOdds)[0];
      return `- [${e.id}] ${e.awayTeamName} @ ${e.homeTeamName} (${e.sportId})${
        best
          ? ` · best ${best.selection} ${formatAmerican(best.americanOdds)} @ ${best.sportsbook}`
          : ""
      }`;
    });
    return {
      content: ["Slate context:", ...lines].join("\n"),
      citations: events.map((e) => `events:${e.id}`),
    };
  }

  if (name === "explain_probabilities") {
    const eventId = typeof args.eventId === "string" ? args.eventId : undefined;
    const { data: quotes } = await odds.getOdds({
      eventId,
      markets: ["moneyline"],
    });
    const pair = quotes.slice(0, 2);
    if (pair.length < 2) {
      return { content: "Not enough moneyline quotes to explain probabilities.", citations: [] };
    }
    const [a, b] = pair;
    const [nvA, nvB] = noVigProbabilities([a.decimalOdds, b.decimalOdds]);
    return {
      content: [
        `${a.selection} ${formatAmerican(a.americanOdds)} ⇒ implied ${(impliedProbability(a.decimalOdds) * 100).toFixed(1)}% · no-vig ${(nvA * 100).toFixed(1)}%`,
        `${b.selection} ${formatAmerican(b.americanOdds)} ⇒ implied ${(impliedProbability(b.decimalOdds) * 100).toFixed(1)}% · no-vig ${(nvB * 100).toFixed(1)}%`,
        "Model probability is a separate estimate and can disagree with both.",
      ].join("\n"),
      citations: [`odds:${a.id}`, `odds:${b.id}`],
    };
  }

  if (name === "size_stake") {
    const modelProbability = Number(args.modelProbability);
    const americanOdds = Number(args.americanOdds);
    const bankroll = Number(args.bankroll);
    if (![modelProbability, americanOdds, bankroll].every(Number.isFinite)) {
      return { content: "Invalid stake inputs.", citations: [] };
    }
    const decimal = americanToDecimal(americanOdds);
    const kelly = fractionalKelly(modelProbability, decimal, 0.25);
    const stake = recommendedStake(bankroll, modelProbability, decimal, 0.25, 0.02);
    const ev = expectedValue(modelProbability, decimal);
    return {
      content: [
        `Assumed model p=${(modelProbability * 100).toFixed(1)}% at ${formatAmerican(americanOdds)}`,
        `EV/unit=${ev.toFixed(3)} · quarter-Kelly share=${(kelly * 100).toFixed(2)}%`,
        `Capped suggested stake ≈ $${stake.toFixed(2)} on a $${bankroll.toFixed(0)} bankroll`,
        "Educational sizing only — not a recommendation to place a wager.",
      ].join("\n"),
      citations: ["betting-math:kelly"],
    };
  }

  return { content: "Unknown tool.", citations: [] };
}
