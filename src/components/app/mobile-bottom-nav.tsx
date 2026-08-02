"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  ScanSearch,
  NotebookPen,
  Wallet,
  Bot,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/odds", label: "Odds", icon: LineChart },
  { href: "/app/scanner", label: "EV", icon: ScanSearch },
  { href: "/app/bets", label: "Bets", icon: NotebookPen },
  { href: "/app/bankroll", label: "Bankroll", icon: Wallet },
  { href: "/app/ai", label: "AI", icon: Bot },
  { href: "/app/settings", label: "More", icon: Settings },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px]",
                  active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
