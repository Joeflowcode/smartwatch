import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripePriceId, type PlanId } from "@/config/pricing";
import { getStripe } from "@/lib/stripe/client";

const BodySchema = z.object({
  plan: z.enum(["pro", "elite"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 },
    );
  }

  let plan: Exclude<PlanId, "free"> = "pro";
  let interval: "monthly" | "annual" = "monthly";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    plan = parsed.data.plan;
    interval = parsed.data.interval;
  } else {
    const form = await request.formData();
    plan = (String(form.get("plan") ?? "pro") as "pro" | "elite");
    interval = (String(form.get("interval") ?? "monthly") as "monthly" | "annual");
  }

  const priceId = getStripePriceId(plan, interval);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price env for ${plan} ${interval}` },
      { status: 500 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app/settings?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: Number(process.env.STRIPE_TRIAL_DAYS ?? 7),
      metadata: { plan },
    },
    metadata: { plan, interval },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
