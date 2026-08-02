import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, SUPPORTED_SPORTS } from "@/config/site";
import { PLANS, TRIAL_DAYS } from "@/config/pricing";

export default function HomePage() {
  return (
    <div>
      <section className="hero-grid relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-16">
          <p className="animate-fade-up font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl md:text-7xl">
            {APP_NAME}
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-2xl text-2xl font-medium tracking-tight text-[var(--muted-foreground)] sm:text-3xl">
            {APP_TAGLINE}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Compare sportsbook odds, estimate expected value, track bets, and set bankroll
            limits — with transparent AI explanations. A research tool for legal-age adults,
            not a sportsbook. Predictions are uncertain.
          </p>
          <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Start free beta</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/pricing">
                Pro from ${PLANS.pro.monthlyPriceUsd} · {TRIAL_DAYS}-day trial
              </Link>
            </Button>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-50 md:block"
        >
          <div className="absolute inset-8 animate-fade-up-delay border border-[var(--border)]/40 bg-[var(--card)]/35 p-6 shadow-[inset_0_0_80px_var(--hero-glow)] backdrop-blur-[2px]">
            <div className="space-y-3 font-mono text-[11px] text-[var(--muted-foreground)]">
              <p className="text-[var(--foreground)]">ODDS · NBA · moneyline</p>
              <p>BOS −118 · best · FanDuel</p>
              <p>NYK +108 · DraftKings</p>
              <p className="animate-pulse-soft text-[var(--primary)]">EV +2.1% · medium quality</p>
              <p>Fresh · mock provider</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--card)]/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-[var(--muted-foreground)] sm:px-6">
          Legal gambling age required. Beta sports: {SUPPORTED_SPORTS.join(" · ")}.
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight">
          How the beta works
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Three steps. No sportsbook account connection. No pressure mechanics.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Create a free account",
              body: "Confirm legal age, set sports preferences, and optional bankroll limits.",
            },
            {
              step: "2",
              title: "Research the slate",
              body: "Compare odds, scan estimated EV with caveats, and ask the AI for grounded explanations.",
            },
            {
              step: "3",
              title: "Track with discipline",
              body: "Log bets manually, review ROI honestly, and get warned when you hit your own loss limits.",
            },
          ].map((item) => (
            <li key={item.step}>
              <p className="text-sm font-medium text-[var(--primary)]">Step {item.step}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight">
            Built for disciplined research
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
            For recreational and data-driven bettors who want explanations — not unexplained picks
            or casino-style pressure.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Odds & EV clarity",
                body: "Normalize lines across books, see implied probability, and review estimated edge with data-quality context.",
              },
              {
                title: "Grounded AI research",
                body: "Ask about matchups, injuries, and bankroll sizing. Responses cite available data and say when information is missing.",
              },
              {
                title: "Risk controls first",
                body: "Set monthly budgets, max stake %, and loss limits. Warnings appear when you exceed your own rules — never pressure to wager more.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight">
          What we will never claim
        </h2>
        <ul className="mt-6 grid gap-3 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
          {[
            "Guaranteed winners or “locks”",
            "Risk-free betting or guaranteed profit",
            "Beat the sportsbook every time",
            "Fixed matches or insider information",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[var(--primary)]">—</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <LegalBanner />
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--muted)]/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
              Ready to research with structure?
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Free forever for core tools. Upgrade to Pro when the scanner and alerts earn it.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/features">See features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
