"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const MARKETING_NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/methodology", label: "Methodology" },
  { href: "/responsible-use", label: "Responsible use" },
  { href: "/faq", label: "FAQ" },
] as const;

export function MarketingNav({ className, compact }: { className?: string; compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Marketing">
      {MARKETING_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              compact ? "shrink-0" : "hover:text-[var(--foreground)]",
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
