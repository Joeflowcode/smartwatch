import { PLANS, type PlanId } from "@/config/pricing";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/stripe/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export type AdminMetrics = {
  mode: "demo" | "live";
  users: number | null;
  mrrUsd: number | null;
  trialCount: number | null;
  activePaid: number | null;
  canceled: number | null;
  notes: string[];
};

/**
 * Best-effort admin metrics. Returns demo placeholders when Stripe/Supabase
 * are missing; otherwise queries subscription rows for a rough MRR estimate.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return {
      mode: "demo",
      users: null,
      mrrUsd: null,
      trialCount: null,
      activePaid: null,
      canceled: null,
      notes: ["Connect Supabase + Stripe to populate live metrics."],
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      mode: "demo",
      users: null,
      mrrUsd: null,
      trialCount: null,
      activePaid: null,
      canceled: null,
      notes: ["Supabase client unavailable in this environment."],
    };
  }

  const notes: string[] = [];
  const [{ count: users }, { data: subs, error }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("plan, status"),
  ]);

  if (error) {
    notes.push(`Subscription query failed: ${error.message}`);
    return {
      mode: "live",
      users: users ?? null,
      mrrUsd: null,
      trialCount: null,
      activePaid: null,
      canceled: null,
      notes,
    };
  }

  const rows = subs ?? [];
  let mrrUsd = 0;
  let trialCount = 0;
  let activePaid = 0;
  let canceled = 0;

  for (const row of rows) {
    const plan = row.plan as PlanId;
    const status = String(row.status ?? "");
    if (status === "trialing") trialCount += 1;
    if (status === "canceled") canceled += 1;
    if (status === "active" || status === "trialing") {
      if (plan !== "free") {
        activePaid += 1;
        mrrUsd += PLANS[plan]?.monthlyPriceUsd ?? 0;
      }
    }
  }

  notes.push("MRR uses list prices for active/trialing paid plans (not invoice actuals).");

  return {
    mode: "live",
    users: users ?? 0,
    mrrUsd,
    trialCount,
    activePaid,
    canceled,
    notes,
  };
}
