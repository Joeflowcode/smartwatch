import type { Metadata } from "next";

export const metadata: Metadata = { title: "Features" };

const FEATURES = [
  {
    title: "Odds comparison",
    body: "Moneyline, spread, totals, and basic props when data quality allows. Implied probability and freshness timestamps on every quote.",
  },
  {
    title: "Expected-value scanner",
    body: "Compare market-implied, no-vig consensus, and model-estimated probabilities. Always shown with risk warnings and reasons the estimate may be wrong.",
  },
  {
    title: "AI research assistant",
    body: "Ask about matchups, line moves, injuries, and bankroll sizing. Grounded in app data with citations — never invents injuries or scores.",
  },
  {
    title: "Bet tracker & bankroll",
    body: "Log bets manually, review ROI and closing-line value, and enforce self-selected loss limits without pressure to increase stakes.",
  },
  {
    title: "Alerts & watchlists",
    body: "Watch games, teams, and EV thresholds. In-app and email alerts with rate limits you control.",
  },
  {
    title: "Arbitrage finder (Elite)",
    body: "Mathematical arb detection with execution-risk warnings. Never advertised as guaranteed profit.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Features
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
        Research workflows for NBA, NFL, MLB, and NHL — designed to inform decisions, not
        encourage impulsive wagering.
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h2 className="text-xl font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
