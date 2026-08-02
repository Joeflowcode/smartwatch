import OpenAI from "openai";
import {
  detectRefusal,
  detectRiskyBehavior,
  REFUSAL_MESSAGE,
  RISK_NUDGE,
} from "@/lib/ai/safety";
import { AI_TOOL_SPECS, runAiTool, type ToolName } from "@/lib/ai/tools";
import type { AIMessage, AIProvider } from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";

const SYSTEM = `You are EdgePilot AI, a sports betting research assistant — not a sportsbook.
Rules:
- Separate factual market data from interpretation.
- Use tools for slate/odds/sizing facts when helpful.
- Never guarantee winners, promise profits, or help place bets.
- Refuse match-fixing, insider tips, underage gambling, or restriction bypass.
- Prefer conservative bankroll language (quarter-Kelly, loss limits).
- If data is missing, say so plainly.`;

/**
 * OpenAI chat adapter with safety pre-checks and optional tool-calling.
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

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const citations: string[] = [];
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      ...params.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    // First pass may request tools.
    let completion = await this.client.chat.completions.create({
      model,
      temperature: 0.3,
      tools: AI_TOOL_SPECS,
      messages,
    });

    const first = completion.choices[0]?.message;
    if (first?.tool_calls?.length) {
      messages.push(first);
      for (const call of first.tool_calls) {
        if (call.type !== "function") continue;
        const name = call.function.name as ToolName;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        const toolResult = await runAiTool(name, args);
        citations.push(...toolResult.citations);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: toolResult.content,
        });
      }

      completion = await this.client.chat.completions.create({
        model,
        temperature: 0.3,
        messages,
      });
    }

    let content =
      completion.choices[0]?.message?.content?.trim() ||
      "I could not generate a response from the model.";

    if (detectRiskyBehavior(last)) {
      content += RISK_NUDGE;
    }

    const extra = Array.from(content.matchAll(/\[?(evt-[a-z0-9-]+)\]?/gi)).map(
      (m) => `context:${m[1]}`,
    );

    return {
      content,
      citations: [...new Set([...citations, ...extra])].slice(0, 12),
      meta: createMeta(this.name, false),
    };
  }
}
