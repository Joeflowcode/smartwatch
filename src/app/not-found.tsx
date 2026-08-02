import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-sm font-medium text-[var(--primary)]">404</p>
      <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-[var(--muted-foreground)]">
        That route doesn&apos;t exist in {APP_NAME}. Head back home or open the research dashboard.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app">Dashboard</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
