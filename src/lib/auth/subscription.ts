import { PlanIdSchema } from "@/types";
import type { PlanId } from "@/config/pricing";
import {
  getDemoSubscription,
  type SubscriptionState,
} from "@/lib/stripe/entitlements";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

export async function getUserSubscription(): Promise<SubscriptionState> {
  const user = await getSessionUser();
  if (!user || user.isDemo) {
    return getDemoSubscription();
  }

  const supabase = await createClient();
  if (!supabase) return getDemoSubscription();

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, stripe_customer_id, stripe_subscription_id, current_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return getDemoSubscription();

  const planParse = PlanIdSchema.safeParse(data.plan);
  const plan: PlanId = planParse.success ? planParse.data : "free";
  const status = (data.status ?? "active") as SubscriptionState["status"];

  return {
    plan,
    status,
    stripeCustomerId: data.stripe_customer_id ?? undefined,
    stripeSubscriptionId: data.stripe_subscription_id ?? undefined,
    currentPeriodEnd: data.current_period_end ?? undefined,
  };
}
