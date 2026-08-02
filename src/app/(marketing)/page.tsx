import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, SUPPORTED_SPORTS } from "@/config/site";
import { PLANS, TRIAL_DAYS } from "@/config/pricing";

export default function HomePage() {
  return (
    <div>
      <section className="hero-plane relative min-h-[calc(100svh-4rem)] overflow-hidden">
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:pr-10">
            <p className="animate-fade-up font-[family-name:var(--font-brand)] text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]">
              {APP_NAME}
            </p>
            <h1 className="animate-fade-up-delay mt-5 max-w-xl text-xl font-medium tracking-tight text-[#cfe7db] sm:text-2xl md:text-3xl">
              {APP_TAGLINE}
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-lg text-base leading-relaxed text-[#a9c7b8] sm:text-lg">
              Odds comparison, expected value, and bankroll discipline — with AI that cites its
              sources. Research for legal-age adults. Not a sportsbook.
            </p>
            <div className="animate-fade-up-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 sm:w-auto"
              >
                <Link href="/signup">Start free beta</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/pricing">
                  Pro from ${PLANS.pro.monthlyPriceUsd} · {TRIAL_DAYS}-day trial
                </Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden
            className="hero-odds-plane relative hidden min-h-full flex-col justify-center px-8 py-16 lg:flex"
          >
            <div className="animate-line-sweep absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
            <div className="animate-fade-up-delay space-y-6 font-mono text-sm text-[#b7d2c5]">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                Live research board
              </p>
              <div className="space-y-4 text-[13px] leading-relaxed">
                <p className="text-white">ODDS · NBA · moneyline</p>
                <p>
                  <span className="text-white">BOS −118</span>
                  <span className="mx-2 text-white/30">·</span>
                  best · FanDuel
                </p>
                <p>
                  <span className="text-white">NYK +108</span>
                  <span className="mx-2 text-white/30">·</span>
                  DraftKings
                </p>
                <p className="animate-pulse-soft text-[var(--accent)]">
                  EV +2.1% · medium quality · not a lock
                </p>
                <p className="text-xs text-white/45">Fresh sample · model estimates are uncertain</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--card)]/70">
        <div className="mx-auto max-w-6xl px-4 py-3.5 text-xs tracking-wide text-[var(--muted-foreground)] sm:px-6">
          Legal gambling age required · Beta sports: {SUPPORTED_SPORTS.join(" · ")}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight sm:text-4xl">
          How the beta works
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Three steps. No sportsbook account connection. No pressure mechanics.
        </p>
        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create a free account",
              body: "Confirm legal age, set sports preferences, and optional bankroll limits.",
            },
            {
              step: "02",
              title: "Research the slate",
              body: "Compare odds, scan estimated EV with caveats, and ask the AI for grounded explanations.",
            },
            {
              step: "03",
              title: "Track with discipline",
              body: "Log bets manually, review ROI honestly, and get warned when you hit your own loss limits.",
            },
          ].map((item) => (
            <li key={item.step}>
              <p className="font-mono text-xs tracking-[0.18em] text-[var(--primary)]">
                {item.step}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for disciplined research
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
            For recreational and data-driven bettors who want explanations — not unexplained picks
            or casino-style pressure.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
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
                <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight sm:text-4xl">
          What we will never claim
        </h2>
        <ul className="mt-8 grid gap-4 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
          {[
            "Guaranteed winners or “locks”",
            "Risk-free betting or guaranteed profit",
            "Beat the sportsbook every time",
            "Fixed matches or insider information",
          ].map((item) => (
            <li key={item} className="flex gap-3 border-t border-[var(--border)] pt-4">
              <span className="font-mono text-[var(--primary)]">—</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <LegalBanner />
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to research with structure?
            </h2>
            <p className="mt-3 max-w-xl text-[#b7d0c5]">
              Free forever for core tools. Upgrade to Pro when the scanner and alerts earn it.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 sm:w-auto"
            >
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              <Link href="/features">See features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
