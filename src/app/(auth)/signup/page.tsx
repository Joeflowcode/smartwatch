"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      document.cookie = `ep_demo_user=${encodeURIComponent(email || "demo@edgepilot.ai")}; path=/; max-age=86400`;
      router.push("/app/onboarding");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      setLoading(false);
      return;
    }

    const origin = window.location.origin;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=/app/onboarding`,
        data: { planned_plan: plan ?? "free" },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Check your email to verify your account, then continue onboarding.");
    router.push("/verify-email");
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Free research access. Upgrade anytime. Analytics only — not a sportsbook."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--foreground)] underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={isSupabaseConfigured()}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            {isSupabaseConfigured() ? (
              <button
                type="button"
                className="text-xs text-[var(--muted-foreground)] underline"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            ) : null}
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isSupabaseConfigured()}
            disabled={!isSupabaseConfigured()}
            placeholder={isSupabaseConfigured() ? "At least 8 characters" : "Not required in demo mode"}
          />
        </div>
        {plan ? (
          <p className="text-xs text-[var(--muted-foreground)]">
            Selected plan intent: <span className="font-medium text-[var(--foreground)]">{plan}</span>{" "}
            (applied after Stripe is connected).
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-[var(--destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="text-sm text-[var(--primary)]">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : isSupabaseConfigured() ? "Sign up" : "Continue in demo mode"}
        </Button>
        {!isSupabaseConfigured() ? (
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Demo explores mock research tools. Connect Supabase for real accounts.
          </p>
        ) : null}
      </form>
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
