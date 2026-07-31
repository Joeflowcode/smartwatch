import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const form = await request.formData();
  const customerId = String(form.get("customerId") ?? process.env.STRIPE_DEMO_CUSTOMER_ID ?? "");
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file. Complete checkout first." },
      { status: 400 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/app/settings`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
