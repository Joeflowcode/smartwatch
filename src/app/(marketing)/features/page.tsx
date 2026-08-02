import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Odds comparison, EV scanner, AI research assistant, bet tracking, and bankroll tools.",
};

const FEATURES = [
  {
    title: "Odds comparison",
    body: "Moneyline, spread, totals, and basic props when data quality allows. Implied probability and freshness timestamps on every quote.",
    href: "/app/odds",
    cta: "Open odds",
  },
  {
    title: "Expected-value scanner",
    body: "Compare market-implied, no-vig consensus, and model-estimated probabilities. Always shown with risk warnings and reasons the estimate may be wrong.",
    href: "/app/scanner",
    cta: "Open EV scanner",
  },
  {
    title: "AI research assistant",
    body: "Ask about matchups, line moves, injuries, and bankroll sizing. Grounded in app data with citations — never invents injuries or scores.",
    href: "/app/ai",
    cta: "Ask AI",
  },
  {
    title: "Bet tracker & bankroll",
    body: "Log bets manually, review ROI and closing-line value, and enforce self-selected loss limits without pressure to increase stakes.",
    href: "/app/bets",
    cta: "Track bets",
  },
  {
    title: "Alerts & watchlists",
    body: "Watch games, teams, and EV thresholds. In-app and email alerts with rate limits you control.",
    href: "/app/alerts",
    cta: "Set alerts",
  },
  {
    title: "Arbitrage finder (Elite)",
    body: "Mathematical arb detection with execution-risk warnings. Never advertised as guaranteed profit.",
    href: "/pricing",
    cta: "See Elite",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight animate-fade-up">
        Features
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted-foreground)] animate-fade-up-delay">
        Research workflows for NBA, NFL, MLB, and NHL — designed to inform decisions, not
        encourage impulsive wagering.
      </p>
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={i % 2 === 0 ? "animate-fade-up" : "animate-fade-up-delay"}
          >
            <h2 className="text-xl font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.body}</p>
            <Link
              href={f.href}
              className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
            >
              {f.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-xl">
        <h2 className="font-[family-name:var(--font-brand)] text-2xl font-semibold">
          Ready to research with discipline?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Start on Free with mock data, then connect live providers when you&apos;re ready.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Compare plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
