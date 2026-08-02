"use client";

import Link from "next/link";
import { isFeatureEnabled } from "@/config/features";
import { track } from "@/lib/analytics";

/** Always-visible affiliate disclosure near outbound book links. */
export function AffiliateDisclosureNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[10px] text-[var(--muted-foreground)]">
        Affiliate links, when shown, are labeled and optional.{" "}
        <Link href="/affiliate-disclosure" className="underline underline-offset-2">
          Disclosure
        </Link>
      </p>
    );
  }

  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-xs text-[var(--muted-foreground)]">
      <p>
        Some sportsbook names may include clearly labeled affiliate links where legally permitted.
        EdgePilot AI may earn a commission. Links never appear for underage users, never endorse a
        specific wager, and the product works without them.
      </p>
      <Link href="/affiliate-disclosure" className="mt-1 inline-block underline underline-offset-2">
        Full affiliate disclosure
      </Link>
    </aside>
  );
}

/** Demo partner destinations — disabled unless NEXT_PUBLIC_FEATURE_affiliateLinks=true. */
export const DEMO_AFFILIATE_HREFS: Record<string, string> = {
  DraftKings: "https://example.com/affiliate/draftkings",
  FanDuel: "https://example.com/affiliate/fanduel",
  BetMGM: "https://example.com/affiliate/betmgm",
};

export function LabeledAffiliateLink({
  href,
  partner,
  children,
  allowed = false,
}: {
  href: string;
  partner?: string;
  children: React.ReactNode;
  /** Only true when partner is active + jurisdiction allowed. */
  allowed?: boolean;
}) {
  if (!allowed) {
    return <span>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="underline underline-offset-2"
      onClick={() =>
        track("affiliate_link_clicked", {
          partner: partner ?? href,
          href,
        })
      }
    >
      {children}
      <span className="ml-1 text-[10px] text-[var(--muted-foreground)]">(affiliate)</span>
    </a>
  );
}

export function SportsbookLabel({ name }: { name: string }) {
  const href = DEMO_AFFILIATE_HREFS[name];
  if (!isFeatureEnabled("affiliateLinks") || !href) return <span>{name}</span>;
  return (
    <LabeledAffiliateLink href={href} partner={name} allowed>
      {name}
    </LabeledAffiliateLink>
  );
}
