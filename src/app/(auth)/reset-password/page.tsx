"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured()) {
      setMessage("Password reset requires Supabase configuration.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/app/settings`,
    });
    if (resetError) setError(resetError.message);
    else setMessage("If an account exists, a reset link has been sent.");
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="We'll email you a secure link."
      footer={
        <Link href="/login" className="underline">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--primary)]">{message}</p> : null}
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
