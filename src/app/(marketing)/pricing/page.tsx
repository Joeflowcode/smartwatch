import type { Metadata } from "next";
import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { PricingTracker } from "@/components/marketing/pricing-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { PLAN_ORDER, PLANS, TRIAL_DAYS } from "@/config/pricing";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free, Pro, and Elite plans for EdgePilot AI research tools.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <PricingTracker />
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
          Simple pricing for serious research
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Start free. Try Pro for {TRIAL_DAYS} days when Stripe is configured. Cancel anytime.
          No wagering — subscription unlocks analytics tools only.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          return (
            <Card
              key={id}
              className={
                plan.highlighted
                  ? "border-[var(--primary)] bg-[var(--card)] shadow-[0_18px_50px_-28px_rgba(10,107,82,0.45)]"
                  : "bg-[var(--card)]/90"
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted ? <Badge className="border-[var(--primary)] text-[var(--primary)]">Most popular</Badge> : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <p className="pt-4">
                  <span className="text-3xl font-semibold">
                    {plan.monthlyPriceUsd === 0
                      ? "Free"
                      : formatCurrency(plan.monthlyPriceUsd)}
                  </span>
                  {plan.monthlyPriceUsd > 0 ? (
                    <span className="text-sm text-[var(--muted-foreground)]"> / month</span>
                  ) : null}
                </p>
                {plan.annualPriceUsd > 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    or {formatCurrency(plan.annualPriceUsd)} / year (2 months free)
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  {id === "free" ? (
                    <Link href="/signup">Create free account</Link>
                  ) : (
                    <Link href={`/signup?plan=${id}`}>Start {plan.name} trial</Link>
                  )}
                </Button>
                {id !== "free" ? (
                  <form action="/api/stripe/checkout" method="post" className="space-y-2">
                    <input type="hidden" name="plan" value={id} />
                    <input type="hidden" name="interval" value="monthly" />
                    <Button type="submit" variant="ghost" className="w-full text-xs text-[var(--muted-foreground)]">
                      Or checkout with Stripe
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-[family-name:var(--font-brand)] text-2xl font-semibold">
          Pricing questions
        </h2>
        <dl className="mt-6 space-y-5 text-sm">
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes. Manage billing in the Stripe Customer Portal after you subscribe. Access continues through the paid period.",
            },
            {
              q: "Do you accept wagers?",
              a: "No. Subscriptions unlock research tools only. We never custody funds or place bets.",
            },
            {
              q: "What happens on Free?",
              a: "Limited AI questions, delayed EV scanner access, and core odds/game pages so you can evaluate the product honestly.",
            },
            {
              q: "Is the trial a credit card trap?",
              a: "When Stripe is configured, trials follow Stripe’s settings. We’ll show clear renewal terms at checkout — never fake urgency.",
            },
          ].map((item) => (
            <div key={item.q}>
              <dt className="font-medium">{item.q}</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12">
        <LegalBanner />
      </div>
    </div>
  );
}
