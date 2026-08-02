"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const FeedbackSchema = z.object({
  category: z.enum(["general", "bug", "feature", "billing"]),
  message: z.string().min(5).max(4000),
  pagePath: z.string().max(300).optional(),
  satisfactionScore: z.number().int().min(1).max(5).optional().nullable(),
  collectDiagnostics: z.boolean().default(false),
  browserMeta: z.record(z.string(), z.unknown()).optional(),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;

export async function submitFeedback(input: FeedbackInput) {
  const parsed = FeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please enter a valid message." };
  }

  const user = await getSessionUser();
  const data = parsed.data;

  // Always keep a local audit trail in logs for demo / when DB unavailable.
  const meta = data.browserMeta ?? {};
  const hasScreenshot = Boolean(meta.screenshotName);

  console.info("[feedback]", {
    userId: user?.id,
    email: user?.email,
    category: data.category,
    pagePath: data.pagePath,
    satisfactionScore: data.satisfactionScore,
    message: data.message.slice(0, 200),
    hasScreenshot,
    screenshotName: meta.screenshotName,
  });

  if (!user || user.isDemo) {
    return {
      ok: true as const,
      mode: "demo" as const,
      message: "Thanks — feedback recorded for this demo session.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: true as const,
      mode: "demo" as const,
      message: "Thanks — feedback recorded locally (database not configured).",
    };
  }

  const { error } = await supabase.from("support_requests").insert({
    user_id: user.id,
    email: user.email,
    category: data.category,
    message: data.message,
    page_path: data.pagePath ?? null,
    satisfaction_score: data.satisfactionScore ?? null,
    browser_meta: data.collectDiagnostics || hasScreenshot ? meta : {},
    status: "open",
  });

  if (error) {
    return { ok: false as const, error: "Could not save feedback. Try again." };
  }

  return {
    ok: true as const,
    mode: "live" as const,
    message: "Thanks — your feedback was saved.",
  };
}
