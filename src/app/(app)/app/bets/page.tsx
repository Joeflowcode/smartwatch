"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createTrackedBet,
  listTrackedBets,
  updateTrackedBetStatus,
} from "@/app/actions/bets";
import { BetAnalytics } from "@/components/app/bet-analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { betsToCsv, downloadTextFile } from "@/lib/betting/clv";
import { americanToDecimal, impliedProbability } from "@/lib/betting/odds";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface BetRow {
  id: string;
  sport: string;
  event: string;
  market: string;
  selection: string;
  sportsbook: string;
  americanOdds: number;
  stake: number;
  status: "open" | "won" | "lost" | "push" | "void";
  notes: string;
  persisted: boolean;
}

const DEMO_KEY = "ep_demo_bets";

function loadDemoBets(): BetRow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]") as BetRow[];
  } catch {
    return [];
  }
}

function saveDemoBets(bets: BetRow[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(bets));
}

export default function BetsPage() {
  const [bets, setBets] = useState<BetRow[]>([]);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await listTrackedBets();
      if (result.ok && result.mode === "live") {
        setMode("live");
        setBets(
          result.bets.map((b) => ({
            id: b.id,
            sport: b.sport,
            event: b.event_label,
            market: b.market,
            selection: b.selection,
            sportsbook: b.sportsbook,
            americanOdds: b.american_odds,
            stake: Number(b.stake),
            status: b.status as BetRow["status"],
            notes: b.notes ?? "",
            persisted: true,
          })),
        );
      } else {
        setMode("demo");
        setBets(loadDemoBets());
      }
      setLoading(false);
    })();
  }, []);

  const analytics = useMemo(() => {
    const settled = bets.filter((b) => b.status !== "open");
    const totalStaked = bets.reduce((s, b) => s + b.stake, 0);
    const pnl = settled.reduce((s, b) => {
      if (b.status === "won") return s + b.stake * (americanToDecimal(b.americanOdds) - 1);
      if (b.status === "lost") return s - b.stake;
      return s;
    }, 0);
    const wins = settled.filter((b) => b.status === "won").length;
    const winRate = settled.length ? wins / settled.length : 0;
    return { totalStaked, pnl, winRate, settled: settled.length };
  }, [bets]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const americanOdds = Number(fd.get("odds"));
    const stake = Number(fd.get("stake"));
    if (!Number.isFinite(americanOdds) || americanOdds === 0) {
      setFormError("Enter valid American odds.");
      return;
    }
    if (!Number.isFinite(stake) || stake <= 0) {
      setFormError("Stake must be positive.");
      return;
    }

    const payload = {
      sport: String(fd.get("sport")),
      eventLabel: String(fd.get("event")),
      market: String(fd.get("market")),
      selection: String(fd.get("selection")),
      sportsbook: String(fd.get("sportsbook")),
      americanOdds,
      stake,
      notes: String(fd.get("notes") ?? "") || null,
    };

    const result = await createTrackedBet(payload);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if (result.mode === "live" && result.bet) {
      const b = result.bet;
      setMode("live");
      setBets((prev) => [
        {
          id: b.id,
          sport: b.sport,
          event: b.event_label,
          market: b.market,
          selection: b.selection,
          sportsbook: b.sportsbook,
          americanOdds: b.american_odds,
          stake: Number(b.stake),
          status: "open",
          notes: b.notes ?? "",
          persisted: true,
        },
        ...prev,
      ]);
    } else {
      const row: BetRow = {
        id: crypto.randomUUID(),
        sport: payload.sport,
        event: payload.eventLabel,
        market: payload.market,
        selection: payload.selection,
        sportsbook: payload.sportsbook,
        americanOdds,
        stake,
        status: "open",
        notes: payload.notes ?? "",
        persisted: false,
      };
      setBets((prev) => {
        const next = [row, ...prev];
        saveDemoBets(next);
        return next;
      });
    }
    e.currentTarget.reset();
  }

  async function onStatusChange(bet: BetRow, status: BetRow["status"]) {
    if (bet.persisted && mode === "live") {
      const result = await updateTrackedBetStatus(bet.id, status);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
    }
    setBets((prev) => {
      const next = prev.map((b) => (b.id === bet.id ? { ...b, status } : b));
      if (mode === "demo") saveDemoBets(next);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
            Bet tracker
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manual logging only. Short-term win rate can be misleading.{" "}
            {mode === "live"
              ? "Saving to your account."
              : "Demo mode — stored in this browser until Supabase is connected."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bets.length === 0}
          onClick={() => {
            const csv = betsToCsv(
              bets.map((b) => ({
                sport: b.sport,
                event: b.event,
                market: b.market,
                selection: b.selection,
                sportsbook: b.sportsbook,
                americanOdds: b.americanOdds,
                stake: b.stake,
                status: b.status,
                notes: b.notes,
              })),
            );
            downloadTextFile(`edgepilot-bets-${new Date().toISOString().slice(0, 10)}.csv`, csv);
          }}
        >
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total staked</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(analytics.totalStaked)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit / loss</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(analytics.pnl)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ROI (settled)</CardDescription>
            <CardTitle className="text-xl">
              {analytics.totalStaked ? formatPercent(analytics.pnl / analytics.totalStaked) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win rate</CardDescription>
            <CardTitle className="text-xl">
              {analytics.settled ? formatPercent(analytics.winRate) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <BetAnalytics bets={bets} />

      <Card>
        <CardHeader>
          <CardTitle>Log a bet</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Input id="sport" name="sport" defaultValue="NBA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sportsbook">Sportsbook</Label>
              <Input id="sportsbook" name="sportsbook" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event">Event</Label>
              <Input id="event" name="event" placeholder="Away @ Home" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Input id="market" name="market" defaultValue="moneyline" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selection">Selection</Label>
              <Input id="selection" name="selection" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odds">American odds</Label>
              <Input id="odds" name="odds" placeholder="-110" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stake">Stake</Label>
              <Input id="stake" name="stake" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" />
            </div>
            {formError ? (
              <p className="text-sm text-[var(--destructive)] sm:col-span-2">{formError}</p>
            ) : null}
            <Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={loading}>
              Save bet
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open & recent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
          ) : bets.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No bets logged yet.</p>
          ) : (
            bets.map((bet) => (
              <div
                key={bet.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {bet.selection} · {bet.event}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {bet.sport} · {bet.market} · {bet.sportsbook} · implied{" "}
                    {formatPercent(impliedProbability(americanToDecimal(bet.americanOdds)))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    {bet.americanOdds > 0 ? `+${bet.americanOdds}` : bet.americanOdds} ·{" "}
                    {formatCurrency(bet.stake)}
                  </span>
                  <select
                    className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
                    value={bet.status}
                    onChange={(e) => {
                      void onStatusChange(bet, e.target.value as BetRow["status"]);
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="push">Push</option>
                    <option value="void">Void</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
