"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[auth-error]", error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4">
      <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold">
        Auth page error
      </h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Something failed while loading this screen. Try again or return home.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
