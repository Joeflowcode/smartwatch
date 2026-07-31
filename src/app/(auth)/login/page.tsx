"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Local demo mode without Supabase
      document.cookie = `ep_demo_user=${encodeURIComponent(email || "demo@edgepilot.ai")}; path=/; max-age=86400`;
      router.push(next.startsWith("/") ? next : "/app");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <AuthCard
      title="Log in"
      subtitle={
        isSupabaseConfigured()
          ? "Welcome back."
          : "Demo mode: Supabase is not configured — continue to explore the app."
      }
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="text-[var(--foreground)] underline">
            Sign up
          </Link>
          {" · "}
          <Link href="/reset-password" className="underline">
            Reset password
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isSupabaseConfigured()}
          />
        </div>
        {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : isSupabaseConfigured() ? "Log in" : "Continue in demo mode"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
