"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { sendAlertEmail } from "@/lib/email/alerts";
import { rateLimit } from "@/lib/security/rate-limit";

const TestAlertSchema = z.object({
  label: z.string().trim().min(1).max(120),
  detail: z.string().trim().min(1).max(500).optional(),
});

export async function sendTestAlertEmail(input: z.infer<typeof TestAlertSchema>) {
  const parsed = TestAlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid alert payload." };
  }

  const user = await getSessionUser();
  if (!user?.email) {
    return { ok: false as const, error: "Sign in to send a test alert email." };
  }

  const limited = rateLimit({
    key: `alert-email:${user.id}`,
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) {
    return { ok: false as const, error: "Too many test emails. Try again later." };
  }

  try {
    const result = await sendAlertEmail({
      to: user.email,
      ruleLabel: parsed.data.label,
      detail:
        parsed.data.detail ??
        "This is a test research alert from EdgePilot AI. No wager was placed.",
    });
    return {
      ok: true as const,
      provider: result.meta.provider,
      isMock: result.meta.isMock,
      message: result.meta.isMock
        ? "Test alert logged via mock email provider (add RESEND_API_KEY for delivery)."
        : "Test alert email sent.",
    };
  } catch (error) {
    console.error("[sendTestAlertEmail]", error);
    return { ok: false as const, error: "Could not send test alert email." };
  }
}
