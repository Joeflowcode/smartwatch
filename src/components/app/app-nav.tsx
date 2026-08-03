"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/odds", label: "Odds" },
  { href: "/app/scanner", label: "EV Scanner" },
  { href: "/app/bets", label: "Bets" },
  { href: "/app/bankroll", label: "Bankroll" },
  { href: "/app/ai", label: "AI" },
  { href: "/app/alerts", label: "Alerts" },
  { href: "/app/arbitrage", label: "Arb" },
  { href: "/app/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden items-center gap-4 text-sm text-[var(--muted-foreground)] lg:flex"
      aria-label="App"
    >
      {APP_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "hover:text-[var(--foreground)]",
              active && "font-medium text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
