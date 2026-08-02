import Link from "next/link";
import { PreferencesCard } from "@/components/app/preferences-card";
import { WatchlistPanel } from "@/components/app/watchlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/config/pricing";
import { getSessionUser } from "@/lib/auth/session";
import { getUserSubscription } from "@/lib/auth/subscription";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const [sub, user] = await Promise.all([getUserSubscription(), getSessionUser()]);
  const plan = PLANS[sub.plan];

  let profileSummary: {
    display_name: string | null;
    country: string | null;
    onboarding_completed_at: string | null;
  } | null = null;

  if (user && !user.isDemo) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, country, onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();
      profileSummary = data;
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user?.email ?? "Unknown"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
          {user?.isDemo ? (
            <p>Demo session — connect Supabase to persist profiles.</p>
          ) : (
            <>
              <p>Display name: {profileSummary?.display_name ?? "—"}</p>
              <p>Country: {profileSummary?.country ?? "—"}</p>
              <p>
                Onboarding:{" "}
                {profileSummary?.onboarding_completed_at
                  ? `Completed ${new Date(profileSummary.onboarding_completed_at).toLocaleString()}`
                  : "Not completed"}
              </p>
              {!profileSummary?.onboarding_completed_at ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/app/onboarding">Finish onboarding</Link>
                </Button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

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
              {sub.stripeCustomerId ? (
                <input type="hidden" name="customerId" value={sub.stripeCustomerId} />
              ) : null}
              <Button type="submit" variant="outline">
                Open billing portal
              </Button>
            </form>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Stripe is not configured yet. Add keys from YOUR_NEXT_STEPS.md to enable checkout.
            </p>
          )}
        </CardContent>
      </Card>

      <PreferencesCard />

      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Games and markets you saved on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <WatchlistPanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beta tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/alerts">Alerts</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/arbitrage">Arbitrage finder</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/api/health">System health</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
