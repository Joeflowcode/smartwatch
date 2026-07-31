import Link from "next/link";
import { assertScannerAccess } from "@/app/actions/entitlements";
import { Badge } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/config/pricing";
import { getUserSubscription } from "@/lib/auth/subscription";
import { formatAmerican } from "@/lib/betting/odds";
import { createOddsProvider } from "@/lib/providers";
import { formatPercent } from "@/lib/utils";

export default async function ScannerPage() {
  const access = await assertScannerAccess();
  const subscription = await getUserSubscription();
  const plan =
    subscription.status === "past_due" || subscription.status === "canceled"
      ? "free"
      : subscription.plan;
  const delayed = PLANS[plan].limits.evScanner === "delayed";

  if (!access.ok) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">EV scanner</h1>
        <p className="text-[var(--muted-foreground)]">{access.error}</p>
        <Button asChild>
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>
    );
  }

  const provider = createOddsProvider();
  const { data, meta } = await provider.getEvOpportunities();
  const visible = delayed ? data.slice(0, 1) : data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">EV scanner</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Compares model-estimated probability to market-implied and no-vig consensus. Never treat
          model probability as certainty.
          {meta.isMock ? (
            <Badge className="ml-2 border-amber-500/40 text-amber-700 dark:text-amber-300">
              Mock data
            </Badge>
          ) : null}
          {delayed ? (
            <Badge className="ml-2">Free plan: delayed / limited results</Badge>
          ) : null}
        </p>
      </div>

      <div className="space-y-4">
        {visible.map((op) => (
          <Card key={op.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{op.selection}</CardTitle>
                  <CardDescription>
                    {op.eventLabel} · {op.market} · {op.sportsbook}{" "}
                    {formatAmerican(op.americanOdds)}
                  </CardDescription>
                </div>
                <div className="text-right text-sm">
                  <p className="font-mono text-lg text-[var(--primary)]">
                    EV {formatPercent(op.expectedValue)}
                  </p>
                  <p className="text-[var(--muted-foreground)]">Edge {formatPercent(op.edge)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Model probability</p>
                <p className="font-mono">{formatPercent(op.modelProbability)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Market implied</p>
                <p className="font-mono">{formatPercent(op.marketProbability)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">No-vig consensus</p>
                <p className="font-mono">{formatPercent(op.noVigProbability)}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Key factors
                </p>
                <ul className="mt-1 list-disc pl-5 text-[var(--muted-foreground)]">
                  {op.keyFactors.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide">Risk warnings</p>
                <ul className="mt-1 list-disc pl-5 text-[var(--muted-foreground)]">
                  {op.riskWarnings.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide">
                  Why this may be wrong
                </p>
                <ul className="mt-1 list-disc pl-5 text-[var(--muted-foreground)]">
                  {op.whyMayBeWrong.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Data quality: {op.dataQuality}
                  {op.sampleSize != null ? ` · sample ${op.sampleSize}` : ""} · updated{" "}
                  {new Date(op.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {delayed ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Upgrade to Pro for the full scanner.{" "}
            <Link href="/pricing" className="underline">
              View pricing
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
