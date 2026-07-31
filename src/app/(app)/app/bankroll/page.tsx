"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBankrollSettings, saveBankrollSettings } from "@/app/actions/bankroll";
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
  const [kellyPct, setKellyPct] = useState(DEFAULT_BANKROLL.kellyFraction * 100);
  const [sessionLoss, setSessionLoss] = useState(0);
  const [weekLoss, setWeekLoss] = useState(0);
  const [modelProb, setModelProb] = useState(0.55);
  const [decimalOdds, setDecimalOdds] = useState(2.0);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const result = await getBankrollSettings();
      if (!result.ok) return;
      setMode(result.mode);
      const s = result.settings;
      setStarting(Number(s.starting_bankroll ?? 0));
      setCurrent(Number(s.current_bankroll ?? 0));
      setMonthlyBudget(Number(s.monthly_budget ?? 0));
      setMaxStakePct(Number(s.max_stake_percent ?? DEFAULT_BANKROLL.maxStakePercent) * 100);
      setDailyLoss(Number(s.daily_loss_limit ?? 50));
      setWeeklyLoss(Number(s.weekly_loss_limit ?? 100));
      setKellyPct(Number(s.kelly_fraction ?? DEFAULT_BANKROLL.kellyFraction) * 100);
    })();
  }, []);

  const overDaily = sessionLoss >= dailyLoss && dailyLoss > 0;
  const overWeekly = weekLoss >= weeklyLoss && weeklyLoss > 0;

  const kelly = useMemo(
    () => fractionalKelly(modelProb, decimalOdds, kellyPct / 100),
    [modelProb, decimalOdds, kellyPct],
  );
  const stake = useMemo(
    () =>
      recommendedStake(current, modelProb, decimalOdds, kellyPct / 100, maxStakePct / 100),
    [current, modelProb, decimalOdds, kellyPct, maxStakePct],
  );

  async function onSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveBankrollSettings({
      startingBankroll: starting,
      currentBankroll: current,
      monthlyBudget: monthlyBudget || null,
      maxStakePercent: maxStakePct / 100,
      dailyLossLimit: dailyLoss || null,
      weeklyLossLimit: weeklyLoss || null,
      kellyFraction: kellyPct / 100,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(result.mode === "live" ? "Saved to your account." : "Saved for this demo session.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
          Bankroll management
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Conservative defaults. The app never pressures you to increase wager size.{" "}
          {mode === "live" ? "Synced to Supabase." : "Demo defaults until Supabase is connected."}
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
            <CardDescription>Save to persist across sessions when auth is live</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Starting bankroll</Label>
              <Input type="number" value={starting} onChange={(e) => setStarting(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Current bankroll</Label>
              <Input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly budget</Label>
              <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max stake %</Label>
              <Input type="number" step="0.1" value={maxStakePct} onChange={(e) => setMaxStakePct(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Daily loss limit</Label>
              <Input type="number" value={dailyLoss} onChange={(e) => setDailyLoss(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Weekly loss limit</Label>
              <Input type="number" value={weeklyLoss} onChange={(e) => setWeeklyLoss(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Kelly fraction %</Label>
              <Input type="number" step="1" value={kellyPct} onChange={(e) => setKellyPct(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Session loss (demo)</Label>
              <Input type="number" value={sessionLoss} onChange={(e) => setSessionLoss(Number(e.target.value))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Week loss (demo)</Label>
              <Input type="number" value={weekLoss} onChange={(e) => setWeekLoss(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <Button type="button" onClick={() => void onSave()} disabled={saving || overDaily || overWeekly}>
                {saving ? "Saving…" : "Save limits"}
              </Button>
              {message ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{message}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stake recommendation</CardTitle>
            <CardDescription>
              Fractional Kelly ({formatPercent(kellyPct / 100)} of full Kelly)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Model probability</Label>
                <Input type="number" step="0.01" min="0" max="1" value={modelProb} onChange={(e) => setModelProb(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Decimal odds</Label>
                <Input type="number" step="0.01" min="1.01" value={decimalOdds} onChange={(e) => setDecimalOdds(Number(e.target.value))} />
              </div>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-4 text-sm">
              <p>
                Fractional Kelly stake share: <span className="font-mono">{formatPercent(kelly)}</span>
              </p>
              <p className="mt-2">
                Max recommended bet: <span className="font-mono text-lg">{formatCurrency(stake)}</span>
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Flat alternative: {formatCurrency(current * (maxStakePct / 100))} at your max stake %.
                Never a signal to chase losses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
