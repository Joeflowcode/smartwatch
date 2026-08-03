import { describe, expect, it } from "vitest";
import { runAiTool } from "@/lib/ai/tools";

describe("AI tools", () => {
  it("returns slate rows with citations", async () => {
    const result = await runAiTool("get_slate", { sport: "nba" });
    expect(result.content.toLowerCase()).toContain("slate");
    expect(result.citations.length).toBeGreaterThan(0);
  });

  it("sizes a conservative stake", async () => {
    const result = await runAiTool("size_stake", {
      modelProbability: 0.55,
      americanOdds: -110,
      bankroll: 1000,
    });
    expect(result.content).toContain("quarter-Kelly");
    expect(result.content).toContain("Educational");
  });
});
