"use server";

import { PLANS } from "@/config/pricing";
import { getSessionUser } from "@/lib/auth/session";
import { getUserSubscription } from "@/lib/auth/subscription";
import { canUseFeature } from "@/lib/stripe/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function checkAiQuota(): Promise<
  { ok: true; remaining: number; limit: number } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const sub = await getUserSubscription();
  if (!canUseFeature(sub, "dailyAiQuestions")) {
    return { ok: false, error: "AI access is not available on your plan." };
  }

  const limit = PLANS[sub.status === "past_due" || sub.status === "canceled" ? "free" : sub.plan]
    .limits.dailyAiQuestions;

  if (user.isDemo) {
    return { ok: true, remaining: limit, limit };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: true, remaining: limit, limit };

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("user_id", user.id);

  const ids = (conversations ?? []).map((c) => c.id);
  if (ids.length === 0) {
    return { ok: true, remaining: limit, limit };
  }

  const { count } = await supabase
    .from("ai_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .in("conversation_id", ids)
    .gte("created_at", start.toISOString());

  const used = count ?? 0;
  if (used >= limit) {
    return {
      ok: false,
      error: `Daily AI limit reached (${limit}). Upgrade for higher limits.`,
    };
  }

  return { ok: true, remaining: Math.max(0, limit - used), limit };
}

export async function assertScannerAccess(): Promise<{ ok: true } | { ok: false; error: string }> {
  const sub = await getUserSubscription();
  const plan =
    sub.status === "past_due" || sub.status === "canceled" ? "free" : sub.plan;
  const access = PLANS[plan].limits.evScanner;
  if (access === "none") {
    return { ok: false, error: "EV scanner requires Pro or Elite." };
  }
  return { ok: true };
}
