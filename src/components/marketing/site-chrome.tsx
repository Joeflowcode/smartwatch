import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/site";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/methodology", label: "Methodology" },
  { href: "/responsible-use", label: "Responsible use" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6 md:max-w-6xl">
        <Link
          href="/"
          className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight sm:text-lg"
        >
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted-foreground)] md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto border-t border-[var(--border)]/60 px-3 py-2 text-xs text-[var(--muted-foreground)] md:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0">
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold">{APP_NAME}</p>
          <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
            Research tool for comparing odds, understanding probability, and managing bankroll
            discipline. Not a sportsbook. No guaranteed outcomes.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Product</p>
          <Link href="/features" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Features
          </Link>
          <Link href="/pricing" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Pricing
          </Link>
          <Link href="/methodology" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Methodology
          </Link>
          <Link href="/contact" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Contact
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Legal</p>
          <Link href="/responsible-use" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Responsible use
          </Link>
          <Link href="/terms" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Terms
          </Link>
          <Link href="/privacy" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Privacy
          </Link>
          <Link href="/affiliate-disclosure" className="block text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Affiliate disclosure
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} {APP_NAME}. For users of legal gambling age only.
      </div>
    </footer>
  );
}
