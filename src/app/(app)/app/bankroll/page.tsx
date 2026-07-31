"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { DEFAULT_BANKROLL } from "@/config/site";
import { fractionalKelly, recommendedStake } from "@/lib/betting/odds";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function BankrollPage() {
  const [starting, setStarting] = useState(1000);
  const [current, setCurrent] = useState(1000);
  const [monthlyBudget, setMonthlyBudget] = useState(200);
  const [maxStakePct, setMaxStakePct] = useState(DEFAULT_BANKROLL.maxStakePercent * 100);
  const [dailyLoss, setDailyLoss] = useState(50);
  const [weeklyLoss, setWeeklyLoss] = useState(100);
  const [sessionLoss, setSessionLoss] = useState(0);
  const [weekLoss, setWeekLoss] = useState(0);
  const [modelProb, setModelProb] = useState(0.55);
  const [decimalOdds, setDecimalOdds] = useState(2.0);

  const overDaily = sessionLoss >= dailyLoss;
  const overWeekly = weekLoss >= weeklyLoss;

  const kelly = useMemo(
    () => fractionalKelly(modelProb, decimalOdds, DEFAULT_BANKROLL.kellyFraction),
    [modelProb, decimalOdds],
  );
  const stake = useMemo(
    () =>
      recommendedStake(
        current,
        modelProb,
        decimalOdds,
        DEFAULT_BANKROLL.kellyFraction,
        maxStakePct / 100,
      ),
    [current, modelProb, decimalOdds, maxStakePct],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
          Bankroll management
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Conservative defaults. The app never pressures you to increase wager size.
        </p>
      </div>

      {(overDaily || overWeekly) && (
        <div className="rounded-lg border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 p-4">
          <p className="font-medium text-[var(--destructive)]">Loss limit reached</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            You exceeded a self-selected {overDaily ? "daily" : "weekly"} loss limit. Consider a
            cool-off break. Promotional upsells are disabled on this page.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/responsible-use">Responsible gambling resources</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Limits</CardTitle>
            <CardDescription>Stored locally in this demo session</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Starting bankroll</Label>
              <Input
                type="number"
                value={starting}
                onChange={(e) => setStarting(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Current bankroll</Label>
              <Input
                type="number"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly budget</Label>
              <Input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max stake %</Label>
              <Input
                type="number"
                step="0.1"
                value={maxStakePct}
                onChange={(e) => setMaxStakePct(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Daily loss limit</Label>
              <Input
                type="number"
                value={dailyLoss}
                onChange={(e) => setDailyLoss(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Weekly loss limit</Label>
              <Input
                type="number"
                value={weeklyLoss}
                onChange={(e) => setWeeklyLoss(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Session loss (demo)</Label>
              <Input
                type="number"
                value={sessionLoss}
                onChange={(e) => setSessionLoss(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Week loss (demo)</Label>
              <Input
                type="number"
                value={weekLoss}
                onChange={(e) => setWeekLoss(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stake recommendation</CardTitle>
            <CardDescription>
              Flat / fractional Kelly ({formatPercent(DEFAULT_BANKROLL.kellyFraction)} Kelly)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Model probability</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={modelProb}
                  onChange={(e) => setModelProb(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Decimal odds</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={decimalOdds}
                  onChange={(e) => setDecimalOdds(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-4 text-sm">
              <p>
                Fractional Kelly stake share:{" "}
                <span className="font-mono">{formatPercent(kelly)}</span>
              </p>
              <p className="mt-2">
                Max recommended bet:{" "}
                <span className="font-mono text-lg">{formatCurrency(stake)}</span>
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Flat alternative: {formatCurrency(current * (maxStakePct / 100))} at your max stake
                %. Never a signal to chase losses.
              </p>
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              <p>Starting: {formatCurrency(starting)}</p>
              <p>Monthly budget remaining concept: {formatCurrency(monthlyBudget)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
