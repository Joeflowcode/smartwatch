import { describe, expect, it } from "vitest";
import { sendAlertEmail } from "@/lib/email/alerts";

describe("sendAlertEmail", () => {
  it("sends via mock email provider without Resend key", async () => {
    const result = await sendAlertEmail({
      to: "demo@edgepilot.ai",
      ruleLabel: "EV threshold 2%",
      detail: "Sample edge crossed your watch threshold on a mock line.",
      deepLink: "http://localhost:3000/app/alerts",
    });
    expect(result.id).toBeTruthy();
    expect(result.meta.isMock).toBe(true);
    expect(result.meta.provider).toContain("mock");
  });
});
