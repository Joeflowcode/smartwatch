import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about EdgePilot AI research tools, pricing, and responsible use.",
};

const FAQS = [
  {
    q: "Is EdgePilot AI a sportsbook?",
    a: "No. We do not accept wagers or hold customer funds. We provide research analytics only.",
  },
  {
    q: "Do you guarantee profits?",
    a: "No. All model outputs are uncertain estimates. Odds change, and past results do not guarantee future performance.",
  },
  {
    q: "Who can use the product?",
    a: "Adults who meet the legal gambling age in their jurisdiction. Users who indicate they are underage cannot access betting-related analysis.",
  },
  {
    q: "Which sports are supported in beta?",
    a: "NBA, NFL, MLB, and NHL. The architecture supports adding more sports later.",
  },
  {
    q: "Can the app place bets for me?",
    a: "Not in beta. Bet tracking is manual. Automated sportsbook connections are feature-flagged and off.",
  },
  {
    q: "How fresh is the odds data?",
    a: "Every quote shows a freshness badge. Mock mode uses sample fixtures. Live mode will refresh from the configured odds provider with stale warnings when updates lag.",
  },
  {
    q: "What are the AI limits?",
    a: "Free includes a small daily question allowance. Pro and Elite raise the cap. The assistant refuses match-fixing, guarantees, underage, and “place bets for me” requests.",
  },
  {
    q: "Can I cancel a paid plan anytime?",
    a: "Yes. After Stripe is connected, manage billing in the Customer Portal. Access continues through the paid period.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        FAQ
      </h1>
      <p className="mt-3 text-[var(--muted-foreground)]">
        Straight answers about what EdgePilot AI is — and what it is not.
      </p>

      <div className="mt-10 space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 open:pb-4"
          >
            <summary className="cursor-pointer list-none text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span
                  aria-hidden
                  className="text-[var(--muted-foreground)] transition group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/signup">Start free</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
