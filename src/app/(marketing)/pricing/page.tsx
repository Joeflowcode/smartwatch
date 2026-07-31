import type { Metadata } from "next";
import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
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
              className={plan.highlighted ? "border-[var(--primary)] shadow-md" : undefined}
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
                    <Button type="submit" variant="ghost" className="w-full text-xs">
                      Checkout with Stripe (if configured)
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <LegalBanner />
      </div>
    </div>
  );
}
