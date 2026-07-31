import Link from "next/link";
import { LegalBanner } from "@/components/legal/legal-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/site";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/odds", label: "Odds" },
  { href: "/app/scanner", label: "EV Scanner" },
  { href: "/app/bets", label: "Bets" },
  { href: "/app/bankroll", label: "Bankroll" },
  { href: "/app/ai", label: "AI" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="font-semibold tracking-tight">
              {APP_NAME}
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-[var(--muted-foreground)] lg:flex">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[var(--foreground)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {email ? (
              <span className="hidden text-xs text-[var(--muted-foreground)] sm:inline">{email}</span>
            ) : null}
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">Upgrade</Link>
            </Button>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted-foreground)] lg:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-2">
        <LegalBanner compact />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
