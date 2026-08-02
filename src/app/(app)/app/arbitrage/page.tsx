import Link from "next/link";
import { isFeatureEnabled } from "@/config/features";
import { PLANS } from "@/config/pricing";
import { getUserSubscription } from "@/lib/auth/subscription";
import { formatAmerican } from "@/lib/betting/odds";
import { findDemoArbitrage } from "@/lib/providers/demo-arbitrage";
import { formatPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ArbitragePage() {
  const enabled = isFeatureEnabled("arbitrageAlerts");
  const sub = await getUserSubscription();
  const plan =
    sub.status === "past_due" || sub.status === "canceled" ? "free" : sub.plan;
  const elite = PLANS[plan].limits.arbitrageScanner;

  if (!enabled) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
          Arbitrage finder
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          This beta feature is behind a feature flag. Set{" "}
          <code className="text-xs">NEXT_PUBLIC_FEATURE_arbitrageAlerts=true</code> to preview.
        </p>
        <Button asChild variant="outline">
          <Link href="/app">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const opportunities = findDemoArbitrage();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
          Arbitrage finder
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Theoretical cross-book opportunities only.{" "}
          <Badge className="ml-1 border-amber-500/40 text-amber-700 dark:text-amber-300">
            Demo / flagged
          </Badge>
        </p>
        {!elite ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Preview mode — Elite unlocks this in production.{" "}
            <Link href="/pricing" className="underline">
              View plans
            </Link>
          </p>
        ) : null}
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-[var(--muted-foreground)]">
            No mathematical arbitrage in the current mock sample. Check back as lines update.
          </CardContent>
        </Card>
      ) : (
        opportunities.map((op) => (
          <Card key={op.eventId}>
            <CardHeader>
              <CardTitle className="text-lg">{op.eventLabel}</CardTitle>
              <CardDescription>
                {op.market} · theoretical margin {formatPercent(op.margin)} · total implied{" "}
                {formatPercent(op.totalImplied)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {op.legs.map((leg) => (
                <div
                  key={`${leg.outcome}-${leg.sportsbook}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                >
                  <span>
                    {leg.outcome} · {leg.sportsbook}
                  </span>
                  <span className="font-mono">
                    {formatAmerican(leg.americanOdds)} · stake{" "}
                    {formatPercent(leg.stakePercent)}
                  </span>
                </div>
              ))}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-[var(--muted-foreground)]">
                <p className="font-medium text-[var(--foreground)]">Execution warnings</p>
                <ul className="mt-1 list-disc pl-4">
                  {op.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <p className="mt-2">Updated {new Date(op.updatedAt).toLocaleString()}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/app/games/${op.eventId}`}>Open game</Link>
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
