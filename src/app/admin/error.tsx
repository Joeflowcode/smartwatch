"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-4 py-16">
      <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
        Admin error
      </h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        The admin shell hit an unexpected error. Try again or return to the app.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/app">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
