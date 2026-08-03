import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 text-sm text-[var(--muted-foreground)]">{footer}</div> : null}
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        By continuing you confirm you meet the legal gambling age in your jurisdiction.{" "}
        <Link href="/responsible-use" className="underline">
          Responsible use
        </Link>
      </p>
    </div>
  );
}
