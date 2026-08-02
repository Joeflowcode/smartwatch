import type { Metadata } from "next";
import { AffiliateDisclosureTracker } from "@/components/marketing/affiliate-disclosure-tracker";

export const metadata: Metadata = { title: "Affiliate disclosure" };

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <AffiliateDisclosureTracker />
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Affiliate disclosure
      </h1>
      <div className="mt-8 space-y-4 text-[var(--muted-foreground)]">
        <p>
          Where legally permitted, EdgePilot AI may include clearly labeled affiliate links to
          licensed sportsbook operators. We may earn a commission if you register or deposit through
          those links.
        </p>
        <p>
          Affiliate relationships never change our research methodology. Links are not shown to
          underage users, respect jurisdiction restrictions, and never imply endorsement of a
          particular wager. The product works fully without affiliate links.
        </p>
        <p>Click tracking may record campaign parameters for reporting. See Privacy for details.</p>
      </div>
    </div>
  );
}
