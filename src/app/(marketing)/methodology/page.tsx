import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Methodology
      </h1>
      <div className="mt-8 space-y-4 text-[var(--muted-foreground)]">
        <p>
          EdgePilot AI separates <strong className="text-[var(--foreground)]">factual market data</strong>{" "}
          (odds, timestamps, published injuries when available) from{" "}
          <strong className="text-[var(--foreground)]">model interpretation</strong> (estimated
          probabilities, expected value, suggested stake sizes).
        </p>
        <p>
          Market-implied probability is derived from decimal odds. No-vig consensus redistributes
          vig across outcomes so probabilities sum to 100%. Expected value compares a model
          probability to the best available price.
        </p>
        <p>
          We surface data quality, sample size when relevant, and explicit reasons an estimate may
          be wrong. Small samples and head-to-head history are not overweighted. Historical
          performance does not guarantee future results.
        </p>
        <p>
          In development, providers may serve clearly labeled mock data when live API keys are
          unavailable. Production never fabricates live odds or injuries.
        </p>
      </div>
    </div>
  );
}
