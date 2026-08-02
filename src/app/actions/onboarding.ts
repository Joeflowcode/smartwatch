"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OnboardingSchema, type OnboardingInput } from "@/lib/validation/onboarding";

export type { OnboardingInput };

export async function completeOnboarding(input: OnboardingInput) {
  const parsed = OnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid onboarding data." };
  }

  const user = await requireSessionUser();
  if (user.isDemo) {
    return { ok: true as const, mode: "demo" as const };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: data.displayName,
      country: data.country,
      region: data.region || null,
      timezone: data.timezone,
      experience_level: data.experienceLevel,
      starting_bankroll: data.startingBankroll,
      monthly_budget: data.monthlyBudget,
      onboarding_completed_at: now,
    })
    .eq("id", user.id);

  if (profileError) {
    return { ok: false as const, error: "Could not save profile." };
  }

  const { error: prefsError } = await supabase.from("user_preferences").upsert({
    user_id: user.id,
    favorite_sports: data.favoriteSports,
    preferred_sportsbooks: data.preferredSportsbooks,
  });

  if (prefsError) {
    return { ok: false as const, error: "Could not save preferences." };
  }

  const { error: ageError } = await supabase.from("age_acknowledgments").upsert({
    user_id: user.id,
    is_legal_age: true,
    responsible_use_accepted: true,
    jurisdiction_note: [data.country, data.region].filter(Boolean).join(", "),
    acknowledged_at: now,
  });

  if (ageError) {
    return { ok: false as const, error: "Could not save age acknowledgment." };
  }

  if (data.startingBankroll != null || data.monthlyBudget != null) {
    await supabase.from("bankroll_settings").upsert({
      user_id: user.id,
      starting_bankroll: data.startingBankroll ?? 0,
      current_bankroll: data.startingBankroll ?? 0,
      monthly_budget: data.monthlyBudget,
    });
  }

  revalidatePath("/app");
  return { ok: true as const, mode: "live" as const };
}

export async function getOnboardingStatus() {
  const user = await requireSessionUser();
  if (user.isDemo) {
    return { completed: false, mode: "demo" as const };
  }

  const supabase = await createClient();
  if (!supabase) return { completed: false, mode: "live" as const };

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    completed: Boolean(data?.onboarding_completed_at),
    mode: "live" as const,
  };
}
