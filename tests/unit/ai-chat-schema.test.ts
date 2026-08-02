import { describe, expect, it } from "vitest";
import { AiChatBodySchema } from "@/lib/validation/ai-chat";

describe("AiChatBodySchema", () => {
  it("defaults saveHistory to false", () => {
    const parsed = AiChatBodySchema.safeParse({
      messages: [{ role: "user", content: "Summarize the slate" }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.saveHistory).toBe(false);
  });

  it("accepts explicit saveHistory", () => {
    const parsed = AiChatBodySchema.safeParse({
      messages: [{ role: "user", content: "Kelly sizing example" }],
      saveHistory: true,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.saveHistory).toBe(true);
  });

  it("rejects empty messages", () => {
    expect(
      AiChatBodySchema.safeParse({
        messages: [{ role: "user", content: "" }],
      }).success,
    ).toBe(false);
  });
});
