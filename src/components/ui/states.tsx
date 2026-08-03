import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-6 py-8 text-center",
        className,
      )}
    >
      <p className="font-medium text-[var(--destructive)]">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
      ) : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--muted)]", className)}
      aria-hidden
    />
  );
}
