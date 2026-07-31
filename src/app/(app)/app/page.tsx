import Link from "next/link";
import { getBankrollSettings, getRecentBetsForDashboard } from "@/app/actions/bankroll";
import { LegalBanner } from "@/components/legal/legal-banner";
import { Badge } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/config/pricing";
import { getUserSubscription } from "@/lib/auth/subscription";
import { formatAmerican } from "@/lib/betting/odds";
import { createOddsProvider } from "@/lib/providers";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const odds = createOddsProvider();
  const [{ data: events, meta }, { data: quotes }, { data: evs }, subscription, bankroll, recentBets] =
    await Promise.all([
      odds.getEvents(),
      odds.getOdds({}),
      odds.getEvOpportunities({ minEdge: 0 }),
      getUserSubscription(),
      getBankrollSettings(),
      getRecentBetsForDashboard(5),
    ]);

  const plan = PLANS[subscription.plan];
  const bankrollAmount =
    bankroll.ok && bankroll.settings ? Number(bankroll.settings.current_bankroll ?? 0) : 0;
  const monthlyBudget =
    bankroll.ok && bankroll.settings ? Number(bankroll.settings.monthly_budget ?? 0) : 0;
  const maxStake =
    bankroll.ok && bankroll.settings
      ? Number(bankroll.settings.max_stake_percent ?? 0.02)
      : 0.02;

  const bestByEvent = events.slice(0, 4).map((event) => {
    const eventOdds = quotes.filter((q) => q.eventId === event.id && q.market === "moneyline");
    const best = eventOdds.sort((a, b) => b.decimalOdds - a.decimalOdds)[0];
    return { event, best };
  });

  const bets = recentBets.ok ? recentBets.bets : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Today&apos;s research snapshot. Estimates are uncertain.
            {meta.isMock ? (
              <Badge className="ml-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
                Mock data
              </Badge>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/app/scanner">Open EV scanner</Link>
          </Button>
          <Button asChild>
            <Link href="/app/ai">Ask AI</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Subscription</CardDescription>
            <CardTitle>{plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Status: {subscription.status}.{" "}
            <Link href="/pricing" className="underline">
              View plans
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Bankroll</CardDescription>
            <CardTitle>{formatCurrency(bankrollAmount)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Max stake {formatPercent(maxStake)}
            {monthlyBudget ? ` · Budget ${formatCurrency(monthlyBudget)}` : ""}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Games on slate</CardDescription>
            <CardTitle>{events.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            NBA · NFL · MLB · NHL
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Positive EV candidates</CardDescription>
            <CardTitle>{evs.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Not guarantees — review data quality
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s games</CardTitle>
            <CardDescription>Best available moneyline sample</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestByEvent.map(({ event, best }) => (
              <Link
                key={event.id}
                href={`/app/games/${event.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-3 hover:bg-[var(--muted)]/40"
              >
                <div>
                  <p className="text-sm font-medium">
                    {event.awayTeamName} @ {event.homeTeamName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(event.startsAt).toLocaleString()} · {event.sportId.toUpperCase()}
                  </p>
                </div>
                {best ? (
                  <div className="text-right text-sm">
                    <p className="font-mono">{formatAmerican(best.americanOdds)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{best.sportsbook}</p>
                  </div>
                ) : null}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EV opportunities</CardTitle>
            <CardDescription>Model estimates vs market — informational only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {evs.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No positive EV in mock set.</p>
            ) : (
              evs.map((op) => (
                <div key={op.id} className="rounded-lg border border-[var(--border)] px-3 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{op.selection}</p>
                    <p className="font-mono text-[var(--primary)]">
                      EV {formatPercent(op.expectedValue)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {op.eventLabel} · {op.sportsbook} · edge {formatPercent(op.edge)} · quality{" "}
                    {op.dataQuality}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent tracked bets</CardTitle>
            <CardDescription>Manual logging only in beta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {bets.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No bets logged yet.{" "}
                <Link href="/app/bets" className="underline">
                  Log a bet
                </Link>
              </p>
            ) : (
              bets.map((bet) => (
                <div key={bet.id} className="flex justify-between gap-2 text-sm">
                  <span>
                    {bet.selection} · {bet.event_label}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {bet.status} · {formatCurrency(Number(bet.stake))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Responsible use</CardTitle>
            <CardDescription>Stay within your limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <LegalBanner />
            <Button asChild variant="outline" size="sm">
              <Link href="/responsible-use">Resources</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
