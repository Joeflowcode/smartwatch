import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim();

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        email
          ? `Click the link we sent to ${email} to activate your account, then complete onboarding.`
          : "Click the link we sent to activate your account, then complete onboarding."
      }
    >
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/login">Return to login</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={email ? `mailto:${email}` : "/signup"}>
            {email ? "Open mail app" : "Back to signup"}
          </Link>
        </Button>
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Didn&apos;t get it? Check spam, or sign up again after a minute.
        </p>
      </div>
    </AuthCard>
  );
}
