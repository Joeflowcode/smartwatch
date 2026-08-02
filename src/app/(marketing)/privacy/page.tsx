import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        Placeholder — counsel review required
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <div className="mt-8 space-y-4 text-sm text-[var(--muted-foreground)]">
        <p>
          This privacy policy placeholder describes our intended practices for the beta. Final
          language requires counsel review.
        </p>
        <p>
          We collect account email, profile preferences, onboarding acknowledgments, subscription
          metadata, bet logs you enter, and product analytics events. We store the minimum needed
          to operate the product.
        </p>
        <p>
          Payment data is processed by Stripe. Authentication is handled by Supabase Auth. Optional
          analytics (e.g. PostHog) and error monitoring (Sentry) may process usage metadata when
          configured. AI prompts may include application data you request to analyze; do not submit
          sensitive personal data unnecessarily.
        </p>
        <p>
          Privacy questions:{" "}
          <Link href="/contact" className="text-[var(--primary)] underline underline-offset-2">
            Contact
          </Link>
          .
        </p>
      </div>
      <div className="mt-10">
        <Button asChild variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
