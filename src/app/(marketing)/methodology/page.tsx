import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How EdgePilot AI separates market facts from model interpretation for sports research.",
};

const SECTIONS = [
  {
    title: "Facts vs interpretation",
    body: "Factual market data includes odds, timestamps, and published injuries when available. Model interpretation covers estimated probabilities, expected value, and suggested stake sizes. UI copy labels which is which.",
  },
  {
    title: "Probability math",
    body: "Market-implied probability is 1 ÷ decimal odds. No-vig consensus redistributes vig across outcomes so probabilities sum to 100%. Expected value compares a model probability to the best available price — never a guarantee.",
  },
  {
    title: "Uncertainty & quality",
    body: "We surface data quality, sample size when relevant, and explicit reasons an estimate may be wrong. Small samples and head-to-head history are not overweighted. Historical performance does not guarantee future results.",
  },
  {
    title: "Mock vs production data",
    body: "In development, providers may serve clearly labeled mock data when live API keys are unavailable. Production never fabricates live odds or injuries. Stale badges appear when refresh lags.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Methodology
      </h1>
      <p className="mt-3 text-[var(--muted-foreground)]">
        Transparent research math — built to inform decisions, not to sell certainty.
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/responsible-use">Responsible use</Link>
        </Button>
        <Button asChild>
          <Link href="/app/scanner">See EV scanner</Link>
        </Button>
      </div>
    </div>
  );
}
