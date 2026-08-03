import type { PlanId } from "@/config/pricing";
import { PLANS, type PlanLimits } from "@/config/pricing";

export interface SubscriptionState {
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "none";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
}

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLANS[plan].limits;
}

export function canUseFeature(
  state: SubscriptionState,
  feature: keyof PlanLimits,
): boolean {
  if (state.status === "past_due" || state.status === "canceled") {
    // Past due / canceled fall back to free entitlements
    return canUseOnPlan("free", feature);
  }
  return canUseOnPlan(state.plan, feature);
}

function canUseOnPlan(plan: PlanId, feature: keyof PlanLimits): boolean {
  const value = PLANS[plan].limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return value !== "none";
}

export function resolvePlanFromPriceId(priceId: string | undefined): PlanId {
  if (!priceId) return "free";
  const map: Record<string, PlanId> = {};
  const pairs: Array<[string | undefined, PlanId]> = [
    [process.env.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [process.env.STRIPE_PRICE_PRO_ANNUAL, "pro"],
    [process.env.STRIPE_PRICE_ELITE_MONTHLY, "elite"],
    [process.env.STRIPE_PRICE_ELITE_ANNUAL, "elite"],
  ];
  for (const [id, plan] of pairs) {
    if (id) map[id] = plan;
  }
  return map[priceId] ?? "free";
}

/** Demo/local subscription when Stripe/Supabase are not configured. */
export function getDemoSubscription(): SubscriptionState {
  return { plan: "free", status: "active" };
}
