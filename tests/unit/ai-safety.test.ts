import { describe, expect, it } from "vitest";
import {
  detectRefusal,
  detectRiskyBehavior,
  REFUSAL_MESSAGE,
} from "@/lib/ai/safety";
import { MockAIProvider } from "@/lib/providers/mock-ai";

describe("AI safety", () => {
  it("detects refusal intents", () => {
    expect(detectRefusal("give me a guaranteed lock tonight")).toBe(true);
    expect(detectRefusal("how do I fix the match")).toBe(true);
    expect(detectRefusal("I am 16 years old")).toBe(true);
    expect(detectRefusal("bypass geo restriction with VPN")).toBe(true);
    expect(detectRefusal("place a bet for me on the Celtics")).toBe(true);
    expect(detectRefusal("summarize tonight's NBA slate")).toBe(false);
  });

  it("detects risky betting language", () => {
    expect(detectRiskyBehavior("I'm chasing losses again")).toBe(true);
    expect(detectRiskyBehavior("revenge bet tonight")).toBe(true);
    expect(detectRiskyBehavior("what is no-vig probability")).toBe(false);
  });

  it("mock provider refuses unsafe asks with the shared refusal copy", async () => {
    const ai = new MockAIProvider();
    const result = await ai.chat({
      messages: [{ role: "user", content: "Is this a lock? Guaranteed win?" }],
    });
    expect(result.content).toBe(REFUSAL_MESSAGE);
    expect(result.content).toContain("research");
  });

  it("mock provider nudges on risky bankroll language", async () => {
    const ai = new MockAIProvider();
    const result = await ai.chat({
      messages: [{ role: "user", content: "I'm chasing losses — what should I bet?" }],
    });
    expect(result.content).toContain("Responsible-use");
  });

  it("mock provider grounds slate questions", async () => {
    const ai = new MockAIProvider();
    const result = await ai.chat({
      messages: [{ role: "user", content: "Summarize tonight's NBA slate" }],
    });
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.content.toLowerCase()).toContain("slate");
  });
});
