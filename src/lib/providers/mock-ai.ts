import {
  detectRefusal,
  detectRiskyBehavior,
  REFUSAL_MESSAGE,
  RISK_NUDGE,
} from "@/lib/ai/safety";
import { runAiTool } from "@/lib/ai/tools";
import type { AIProvider } from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";

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
      const sport = /nfl/i.test(last)
        ? "nfl"
        : /mlb/i.test(last)
          ? "mlb"
          : /nhl/i.test(last)
            ? "nhl"
            : "nba";
      payload = await runAiTool("get_slate", { sport });
      payload.content =
        "**Tonight’s sample slate (factual records from mock provider)**\n\n" +
        payload.content +
        "\n\n**Interpretation (not certainty):** These are research snapshots. Lines move, injuries change, and mock data is labeled for development.";
    } else if (/market probability|model probability|no-?vig|implied/i.test(last)) {
      payload = await runAiTool("explain_probabilities", {});
      payload.content =
        "**Probability primer**\n\n" +
        payload.content +
        "\n\nNever treat model probability as a lock.";
    } else if (/kelly|bankroll|stake|wager size|conservative/i.test(last)) {
      payload = await runAiTool("size_stake", {
        modelProbability: 0.55,
        americanOdds: -110,
        bankroll: 1000,
      });
      payload.content = "**Conservative bankroll example (interpretation)**\n\n" + payload.content;
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
      payload = await runAiTool("get_slate", {});
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
