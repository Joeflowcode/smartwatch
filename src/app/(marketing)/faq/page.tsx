import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

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
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">FAQ</h1>
      <dl className="mt-10 space-y-8">
        {FAQS.map((item) => (
          <div key={item.q}>
            <dt className="text-lg font-semibold">{item.q}</dt>
            <dd className="mt-2 text-[var(--muted-foreground)]">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
