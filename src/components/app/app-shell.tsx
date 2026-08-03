import Link from "next/link";
import { SkipToContent } from "@/components/a11y/skip-to-content";
import { AppNav } from "@/components/app/app-nav";
import { FeedbackWidget } from "@/components/app/feedback-widget";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { LegalBanner } from "@/components/legal/legal-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/site";

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
      <SkipToContent />
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--surface-elevated)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/app"
              className="truncate font-[family-name:var(--font-brand)] font-semibold tracking-tight"
            >
              {APP_NAME}
            </Link>
            <AppNav />
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {email ? (
              <span className="hidden max-w-[140px] truncate text-xs text-[var(--muted-foreground)] md:inline">
                {email}
              </span>
            ) : null}
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/pricing">Upgrade</Link>
            </Button>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4">
        <LegalBanner compact />
      </div>
      <main id="main-content" className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        {children}
      </main>
      <MobileBottomNav />
      <FeedbackWidget />
    </div>
  );
}
