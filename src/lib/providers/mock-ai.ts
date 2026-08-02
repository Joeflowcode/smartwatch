import { mockEvents, mockOdds } from "@/lib/providers/mock-odds";
import {
  detectRefusal,
  detectRiskyBehavior,
  REFUSAL_MESSAGE,
  RISK_NUDGE,
} from "@/lib/ai/safety";
import type { AIProvider } from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";
import {
  americanToDecimal,
  expectedValue,
  formatAmerican,
  impliedProbability,
  noVigProbabilities,
} from "@/lib/betting/odds";

function groundedSlateSummary(): { content: string; citations: string[] } {
  const citations = mockEvents.map((e) => `mock-events:${e.id}`);
  const lines = mockEvents.map((e) => {
    const ml = mockOdds.filter((o) => o.eventId === e.id && o.market === "moneyline");
    const best = ml.sort((a, b) => b.decimalOdds - a.decimalOdds)[0];
    return `- ${e.awayTeamName} @ ${e.homeTeamName} (${e.sportId.toUpperCase()}) · starts ${new Date(e.startsAt).toLocaleString()}${best ? ` · best sample ML ${best.selection} ${formatAmerican(best.americanOdds)} @ ${best.sportsbook}` : ""}`;
  });

  return {
    content: [
      "**Tonight’s sample slate (factual records from mock provider)**",
      "",
      ...lines,
      "",
      "**Interpretation (not certainty):** These are research snapshots. Lines move, injuries change, and mock data is labeled for development.",
      `Fetched context timestamp: ${new Date().toISOString()}`,
    ].join("\n"),
    citations,
  };
}

function explainProbabilities(): { content: string; citations: string[] } {
  const home = mockOdds.find((o) => o.id === "o3") ?? mockOdds[0];
  const away = mockOdds.find((o) => o.id === "o4") ?? mockOdds[1];
  const [nvHome, nvAway] = noVigProbabilities([home.decimalOdds, away.decimalOdds]);
  return {
    content: [
      "**Market probability** is the implied chance from a sportsbook price (includes vig).",
      `Example: ${home.selection} at ${formatAmerican(home.americanOdds)} ⇒ implied ${(impliedProbability(home.decimalOdds) * 100).toFixed(1)}%.`,
      "",
      "**No-vig probability** redistributes vig so outcomes sum to 100%.",
      `Example (FanDuel two-way): home ${(nvHome * 100).toFixed(1)}% / away ${(nvAway * 100).toFixed(1)}%.`,
      "",
      "**Model probability** is our estimate from available stats — an interpretation that can be wrong.",
      "",
      "Never treat model probability as a lock.",
    ].join("\n"),
    citations: [`mock-odds:${home.id}`, `mock-odds:${away.id}`],
  };
}

function kellyExplain(): { content: string; citations: string[] } {
  const decimal = americanToDecimal(-110);
  const modelP = 0.55;
  const ev = expectedValue(modelP, decimal);
  return {
    content: [
      "**Conservative bankroll example (interpretation)**",
      `- Assumed model probability: 55% (estimate, not a fact)`,
      `- Price: -110 (decimal ${decimal.toFixed(3)})`,
      `- Expected value per $1 stake: ${ev.toFixed(3)} (positive in this toy example)`,
      `- Quarter-Kelly is the app default for stake suggestions and is capped by your max stake %`,
      "",
      "This is educational sizing math — not advice to place a wager. If it feels stressful, reduce limits or take a break.",
    ].join("\n"),
    citations: ["betting-math:kelly", "config:DEFAULT_BANKROLL"],
  };
}

export class MockAIProvider implements AIProvider {
  readonly name = "mock-ai";

  async chat(params: { messages: { role: string; content: string }[] }) {
    const last = params.messages.filter((m) => m.role === "user").at(-1)?.content ?? "";

    if (detectRefusal(last)) {
      return {
        content: REFUSAL_MESSAGE,
        citations: [],
        meta: createMeta(this.name, true),
      };
    }

    let payload: { content: string; citations: string[] };

    if (/slate|tonight|summarize.*(nba|games)|what.?s on/i.test(last)) {
      payload = groundedSlateSummary();
    } else if (/market probability|model probability|no-?vig|implied/i.test(last)) {
      payload = explainProbabilities();
    } else if (/kelly|bankroll|stake|wager size|conservative/i.test(last)) {
      payload = kellyExplain();
    } else if (/misleading|why.*edge|false.*edge|trap/i.test(last)) {
      payload = {
        content: [
          "**Why an apparent edge may be misleading**",
          "- Stale quotes or different limits across books",
          "- Model using small samples or outdated injuries",
          "- Market already priced information you don’t have",
          "- Closing line may move against you",
          "- Vig and transaction frictions shrink theoretical EV",
          "",
          "Treat every positive EV flag as a hypothesis to stress-test — never a guaranteed winner.",
        ].join("\n"),
        citations: ["methodology:ev-caveats"],
      };
    } else if (/injur/i.test(last)) {
      payload = {
        content: [
          "**Injury context (mock factual record)**",
          "- Example Forward (away side): Questionable — mock ankle sprain, illustrative only.",
          "",
          "**Interpretation:** Questionable tags can resolve either way close to tip-off. We do not invent injury statuses beyond provider data.",
          `Timestamp: ${new Date().toISOString()}`,
        ].join("\n"),
        citations: ["mock-injury:inj-1"],
      };
    } else if (/line.?move|moved the most/i.test(last)) {
      payload = {
        content: [
          "**Line movement (mock sample)**",
          "- Largest illustrative moves are not live feeds in this environment.",
          "- Compare timestamps on the Odds page; prefer fresher quotes.",
          "- Sudden moves can reflect sharp action, injury news, or book-specific limits — we cannot distinguish those from mock data alone.",
        ].join("\n"),
        citations: ["mock-odds:snapshot"],
      };
    } else {
      payload = groundedSlateSummary();
      payload.content =
        "I don’t have a specialized tool answer for that exact question yet, so here’s the grounded slate context I can cite:\n\n" +
        payload.content +
        "\n\nAsk about slate summary, probabilities, injuries, Kelly sizing, or why an edge might be wrong.";
    }

    if (detectRiskyBehavior(last)) {
      payload.content += RISK_NUDGE;
    }

    return {
      content: payload.content,
      citations: payload.citations,
      meta: createMeta(this.name, true),
    };
  }
}
