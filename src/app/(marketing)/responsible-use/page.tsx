import type { Metadata } from "next";
import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Responsible use" };

const RESOURCES = [
  { region: "United States", name: "NCPG", url: "https://www.ncpgambling.org/" },
  { region: "United States", name: "1-800-GAMBLER", url: "https://www.1800gambler.net/" },
  { region: "International", name: "Gambling Therapy", url: "https://www.gamblingtherapy.org/" },
];

export default function ResponsibleUsePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Responsible use
      </h1>
      <div className="prose-sm mt-8 space-y-4 text-[var(--muted-foreground)]">
        <p>
          EdgePilot AI is an analytics product. We do not accept wagers, custody customer money, or
          operate as a sportsbook. Model outputs are informational estimates.
        </p>
        <p>You should:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Only use sports betting products if you meet the legal age in your jurisdiction.</li>
          <li>Never wager money you cannot afford to lose.</li>
          <li>Set and respect bankroll, daily, and weekly loss limits.</li>
          <li>Take a break when betting stops being recreational.</li>
          <li>Treat short-term win rate as noisy — it can be misleading.</li>
        </ul>
        <p>We deliberately avoid casino-style mechanics: no loot boxes, fake urgency, streak rewards tied to betting activity, or bonuses linked to losses.</p>
      </div>
      <h2 className="mt-10 text-xl font-semibold">Help resources</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {RESOURCES.map((r) => (
          <li key={r.name}>
            <span className="text-[var(--muted-foreground)]">{r.region}: </span>
            <a href={r.url} className="text-[var(--primary)] underline underline-offset-2" target="_blank" rel="noreferrer">
              {r.name}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/app/bankroll">Set bankroll limits</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Talk to us</Link>
        </Button>
      </div>
      <div className="mt-10">
        <LegalBanner />
      </div>
    </div>
  );
}
