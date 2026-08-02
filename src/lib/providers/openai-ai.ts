import OpenAI from "openai";
import {
  detectRefusal,
  detectRiskyBehavior,
  REFUSAL_MESSAGE,
  RISK_NUDGE,
} from "@/lib/ai/safety";
import type { AIMessage, AIProvider } from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";
import { MockOddsProvider } from "@/lib/providers/mock-odds";

const SYSTEM = `You are EdgePilot AI, a sports betting research assistant — not a sportsbook.
Rules:
- Separate factual market data from interpretation.
- Never guarantee winners, promise profits, or help place bets.
- Refuse match-fixing, insider tips, underage gambling, or restriction bypass.
- Cite tool/context ids when you use them (e.g. mock-events:evt-nba-1).
- Prefer conservative bankroll language (quarter-Kelly, loss limits).
- If data is missing, say so plainly.`;

async function loadGroundingContext(): Promise<string> {
  const odds = new MockOddsProvider();
  const [{ data: events }, { data: quotes }] = await Promise.all([
    odds.getEvents(),
    odds.getOdds({ markets: ["moneyline"] }),
  ]);
  const lines = events.slice(0, 8).map((e) => {
    const ml = quotes.filter((q) => q.eventId === e.id);
    const best = ml.sort((a, b) => b.decimalOdds - a.decimalOdds)[0];
    return `- [${e.id}] ${e.awayTeamName} @ ${e.homeTeamName} (${e.sportId}) ${best ? `best ML ${best.selection} ${best.americanOdds} @ ${best.sportsbook}` : ""}`;
  });
  return ["Available slate context:", ...lines].join("\n");
}

/**
 * OpenAI chat adapter with safety pre-checks and grounded system context.
 * Full tool-calling can expand on this when live providers are connected.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(params: { messages: AIMessage[] }) {
    const last = params.messages.filter((m) => m.role === "user").at(-1)?.content ?? "";

    if (detectRefusal(last)) {
      return {
        content: REFUSAL_MESSAGE,
        citations: [],
        meta: createMeta(this.name, false),
      };
    }

    const grounding = await loadGroundingContext();
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const completion = await this.client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: `${SYSTEM}\n\n${grounding}` },
        ...params.messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
    });

    let content =
      completion.choices[0]?.message?.content?.trim() ||
      "I could not generate a response from the model.";

    if (detectRiskyBehavior(last)) {
      content += RISK_NUDGE;
    }

    const citations = Array.from(content.matchAll(/\[?(evt-[a-z0-9-]+)\]?/gi)).map(
      (m) => `context:${m[1]}`,
    );

    return {
      content,
      citations: [...new Set(citations)].slice(0, 8),
      meta: createMeta(this.name, false),
    };
  }
}
