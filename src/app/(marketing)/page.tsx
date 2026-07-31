import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, SUPPORTED_SPORTS } from "@/config/site";

export default function HomePage() {
  return (
    <div>
      <section className="hero-grid relative overflow-hidden">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
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
          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Start free beta</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-[var(--muted-foreground)]">
            Must meet the legal gambling age in your jurisdiction. {SUPPORTED_SPORTS.join(" · ")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
              Ready to research with structure?
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Create a free account. Upgrade when the Pro tools earn their place in your workflow.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">Create free account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
