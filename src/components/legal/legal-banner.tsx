import Link from "next/link";
import { LEGAL_DISCLAIMER } from "@/config/site";

export function LegalBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">
        Analytics only — not a sportsbook. Estimates are uncertain. 21+ / legal age required.{" "}
        <Link href="/responsible-use" className="underline underline-offset-2">
          Responsible use
        </Link>
      </p>
    );
  }

  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/60 p-4 text-sm text-[var(--muted-foreground)]">
      <p>{LEGAL_DISCLAIMER}</p>
    </aside>
  );
}
