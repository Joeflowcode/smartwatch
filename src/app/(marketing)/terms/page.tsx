import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        Placeholder — counsel review required
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <div className="mt-8 space-y-4 text-sm text-[var(--muted-foreground)]">
        <p>
          These terms are a temporary placeholder for the EdgePilot AI beta. They are not legal
          advice and must be reviewed by counsel before production launch.
        </p>
        <p>
          EdgePilot AI provides analytics and educational information only. We do not accept
          wagers, operate a sportsbook, or guarantee outcomes. You are responsible for complying
          with local law and confirming you meet the legal gambling age in your jurisdiction.
        </p>
        <p>
          Subscriptions are billed via Stripe. You may cancel through the customer portal. Usage
          limits apply by plan. We may suspend accounts that abuse the service or attempt illegal
          activity.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/contact">Questions? Contact us</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/responsible-use">Responsible use</Link>
        </Button>
      </div>
    </div>
  );
}
