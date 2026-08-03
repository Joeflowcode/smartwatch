"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_BANKROLL } from "@/config/site";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BankrollSchema } from "@/lib/validation/bankroll";

export async function getBankrollSettings() {
  const user = await requireSessionUser();
  if (user.isDemo) {
    return {
      ok: true as const,
      mode: "demo" as const,
      settings: {
        starting_bankroll: 1000,
        current_bankroll: 1000,
        monthly_budget: 200,
        max_stake_percent: DEFAULT_BANKROLL.maxStakePercent,
        daily_loss_limit: 50,
        weekly_loss_limit: 100,
        kelly_fraction: DEFAULT_BANKROLL.kellyFraction,
        cool_off_until: null as string | null,
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const { data, error } = await supabase
    .from("bankroll_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false as const, error: "Could not load bankroll settings." };
  }

  return {
    ok: true as const,
    mode: "live" as const,
    settings: data ?? {
      starting_bankroll: 0,
      current_bankroll: 0,
      monthly_budget: null,
      max_stake_percent: DEFAULT_BANKROLL.maxStakePercent,
      daily_loss_limit: null,
      weekly_loss_limit: null,
      kelly_fraction: DEFAULT_BANKROLL.kellyFraction,
      cool_off_until: null,
    },
  };
}

export async function saveBankrollSettings(input: z.infer<typeof BankrollSchema>) {
  const parsed = BankrollSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid bankroll settings." };
  }

  const user = await requireSessionUser();
  if (user.isDemo) {
    return { ok: true as const, mode: "demo" as const };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const { error } = await supabase.from("bankroll_settings").upsert({
    user_id: user.id,
    starting_bankroll: parsed.data.startingBankroll,
    current_bankroll: parsed.data.currentBankroll,
    monthly_budget: parsed.data.monthlyBudget,
    max_stake_percent: parsed.data.maxStakePercent,
    daily_loss_limit: parsed.data.dailyLossLimit,
    weekly_loss_limit: parsed.data.weeklyLossLimit,
    kelly_fraction: parsed.data.kellyFraction,
  });

  if (error) {
    return { ok: false as const, error: "Could not save bankroll settings." };
  }

  revalidatePath("/app/bankroll");
  revalidatePath("/app");
  return { ok: true as const, mode: "live" as const };
}

export async function getRecentBetsForDashboard(limit = 5) {
  const user = await requireSessionUser();
  if (user.isDemo) {
    return { ok: true as const, mode: "demo" as const, bets: [] as never[] };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const { data, error } = await supabase
    .from("tracked_bets")
    .select("id, event_label, selection, sportsbook, stake, status, american_odds, profit_loss")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { ok: false as const, error: "Could not load bets." };
  }

  return { ok: true as const, mode: "live" as const, bets: data ?? [] };
}
