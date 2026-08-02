"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BetSchema, BetStatusSchema } from "@/lib/validation/bets";

export async function listTrackedBets() {
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
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("bet_date", { ascending: false })
    .limit(100);

  if (error) {
    return { ok: false as const, error: "Could not load bets." };
  }

  return { ok: true as const, mode: "live" as const, bets: data ?? [] };
}

export async function createTrackedBet(input: z.infer<typeof BetSchema>) {
  const parsed = BetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid bet data." };
  }

  const user = await requireSessionUser();
  if (user.isDemo) {
    return { ok: true as const, mode: "demo" as const, bet: null };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const { data, error } = await supabase
    .from("tracked_bets")
    .insert({
      user_id: user.id,
      sport: parsed.data.sport,
      league: parsed.data.league ?? null,
      event_label: parsed.data.eventLabel,
      market: parsed.data.market,
      selection: parsed.data.selection,
      sportsbook: parsed.data.sportsbook,
      american_odds: parsed.data.americanOdds,
      stake: parsed.data.stake,
      notes: parsed.data.notes ?? null,
      tags: parsed.data.tags ?? [],
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false as const, error: "Could not save bet." };
  }

  revalidatePath("/app/bets");
  revalidatePath("/app");
  return { ok: true as const, mode: "live" as const, bet: data };
}

export async function updateTrackedBetStatus(betId: string, status: z.infer<typeof BetStatusSchema>) {
  const parsedStatus = BetStatusSchema.safeParse(status);
  if (!parsedStatus.success || !z.string().uuid().safeParse(betId).success) {
    return { ok: false as const, error: "Invalid update." };
  }

  const user = await requireSessionUser();
  if (user.isDemo) {
    return { ok: true as const, mode: "demo" as const };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Database is not configured." };
  }

  const { data: existing } = await supabase
    .from("tracked_bets")
    .select("stake, american_odds")
    .eq("id", betId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return { ok: false as const, error: "Bet not found." };
  }

  let profitLoss: number | null = null;
  if (parsedStatus.data === "won") {
    const decimal =
      existing.american_odds > 0
        ? existing.american_odds / 100 + 1
        : 100 / Math.abs(existing.american_odds) + 1;
    profitLoss = Number(existing.stake) * (decimal - 1);
  } else if (parsedStatus.data === "lost") {
    profitLoss = -Number(existing.stake);
  } else if (parsedStatus.data === "push" || parsedStatus.data === "void") {
    profitLoss = 0;
  }

  const { error } = await supabase
    .from("tracked_bets")
    .update({
      status: parsedStatus.data,
      profit_loss: profitLoss,
      result: parsedStatus.data,
    })
    .eq("id", betId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false as const, error: "Could not update bet." };
  }

  revalidatePath("/app/bets");
  revalidatePath("/app");
  return { ok: true as const, mode: "live" as const };
}
