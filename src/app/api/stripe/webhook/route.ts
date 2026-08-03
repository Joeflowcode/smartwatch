import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { resolvePlanFromPriceId } from "@/lib/stripe/entitlements";
import { createServiceRoleClient } from "@/lib/supabase/middleware";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string" ? session.customer : "";
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : "";
        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (admin && userId) {
          await admin.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
            plan: session.metadata?.plan ?? "pro",
            status: "trialing",
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = resolvePlanFromPriceId(priceId);
        const deleted = event.type === "customer.subscription.deleted";
        const status = deleted
          ? "canceled"
          : subscription.status === "active" ||
              subscription.status === "trialing" ||
              subscription.status === "past_due"
            ? subscription.status
            : "canceled";
        if (admin) {
          await admin
            .from("subscriptions")
            .update({
              plan: deleted ? "free" : plan,
              status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subRef = invoice.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (admin && subId) {
          await admin
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }
      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
