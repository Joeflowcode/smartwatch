"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { americanToDecimal } from "@/lib/betting/odds";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface AnalyticsBet {
  id: string;
  sport: string;
  market: string;
  sportsbook: string;
  americanOdds: number;
  stake: number;
  status: "open" | "won" | "lost" | "push" | "void";
}

function pnlFor(bet: AnalyticsBet): number {
  if (bet.status === "won") {
    return bet.stake * (americanToDecimal(bet.americanOdds) - 1);
  }
  if (bet.status === "lost") return -bet.stake;
  return 0;
}

function groupSum(bets: AnalyticsBet[], key: (b: AnalyticsBet) => string) {
  const map = new Map<string, { stake: number; pnl: number; count: number }>();
  for (const bet of bets) {
    if (bet.status === "open") continue;
    const k = key(bet);
    const cur = map.get(k) ?? { stake: 0, pnl: 0, count: 0 };
    cur.stake += bet.stake;
    cur.pnl += pnlFor(bet);
    cur.count += 1;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
}

export function BetAnalytics({ bets }: { bets: AnalyticsBet[] }) {
  const settled = useMemo(() => bets.filter((b) => b.status !== "open"), [bets]);
  const bySport = useMemo(() => groupSum(bets, (b) => b.sport), [bets]);
  const byMarket = useMemo(() => groupSum(bets, (b) => b.market), [bets]);
  const byBook = useMemo(() => groupSum(bets, (b) => b.sportsbook), [bets]);

  const equity = useMemo(() => {
    return settled.reduce<{ idx: number; value: number }[]>((points, bet, idx) => {
      const prev = points[idx - 1]?.value ?? 0;
      points.push({ idx: idx + 1, value: prev + pnlFor(bet) });
      return points;
    }, []);
  }, [settled]);

  const maxAbs = Math.max(1, ...equity.map((p) => Math.abs(p.value)));

  if (bets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance over time</CardTitle>
          <CardDescription>
            Cumulative P&amp;L on settled bets. Short-term win rate can be misleading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equity.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Settle a few bets to see the equity curve.
            </p>
          ) : (
            <div className="flex h-36 items-end gap-1">
              {equity.map((p) => (
                <div key={p.idx} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full max-w-[28px] rounded-t-sm"
                    style={{
                      height: `${Math.max(4, (Math.abs(p.value) / maxAbs) * 100)}%`,
                      background:
                        p.value >= 0 ? "var(--chart-up)" : "var(--chart-down)",
                      opacity: 0.85,
                    }}
                    title={`Bet #${p.idx}: ${formatCurrency(p.value)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "By sport", rows: bySport },
          { title: "By market", rows: byMarket },
          { title: "By sportsbook", rows: byBook },
        ].map((block) => (
          <Card key={block.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {block.rows.length === 0 ? (
                <p className="text-[var(--muted-foreground)]">No settled bets yet.</p>
              ) : (
                block.rows.slice(0, 6).map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <span className="truncate">{row.label}</span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {formatCurrency(row.pnl)} · ROI{" "}
                      {row.stake ? formatPercent(row.pnl / row.stake) : "—"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
