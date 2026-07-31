import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isStripeConfigured } from "@/lib/stripe/client";
import { getDemoSubscription } from "@/lib/stripe/entitlements";
import { PLANS } from "@/config/pricing";

export default function SettingsPage() {
  const sub = getDemoSubscription();
  const plan = PLANS[sub.plan];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Current plan: {plan.name} ({sub.status})
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/pricing">Change plan</Link>
          </Button>
          {isStripeConfigured() ? (
            <form action="/api/stripe/portal" method="post">
              <Button type="submit" variant="outline">
                Open billing portal
              </Button>
            </form>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Stripe is not configured in this environment. Set Stripe keys to enable checkout and
              the customer portal.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Synced to Supabase when connected</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Update sports, sportsbooks, and alert frequency from onboarding for now. Full preference
          editor ships with profile persistence.
        </CardContent>
      </Card>
    </div>
  );
}
