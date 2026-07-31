import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="Click the link we sent to activate your account, then complete onboarding."
    >
      <Button asChild className="w-full">
        <Link href="/login">Return to login</Link>
      </Button>
    </AuthCard>
  );
}
