import { NextResponse } from "next/server";
import { FEATURE_FLAGS } from "@/config/site";
import { PLANS } from "@/config/pricing";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isStripeConfigured } from "@/lib/stripe/client";

export async function GET() {
  const body = {
    ok: true,
    service: "edgepilot-ai",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    integrations: {
      supabase: isSupabaseConfigured(),
      stripe: isStripeConfigured(),
      oddsProvider: process.env.ODDS_PROVIDER ?? "mock",
      aiProvider: process.env.AI_PROVIDER ?? "mock",
      email: Boolean(process.env.RESEND_API_KEY),
    },
    plans: Object.keys(PLANS),
    featureFlags: FEATURE_FLAGS,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
