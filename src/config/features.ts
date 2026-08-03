import { FEATURE_FLAGS } from "@/config/site";

type FlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Runtime feature flags. Env `NEXT_PUBLIC_FEATURE_<FLAG>=true|false` overrides defaults.
 * Example: NEXT_PUBLIC_FEATURE_arbitrageAlerts=true
 */
export function isFeatureEnabled(flag: FlagKey): boolean {
  const envName = `NEXT_PUBLIC_FEATURE_${flag}`;
  const override = process.env[envName];
  if (override === "true") return true;
  if (override === "false") return false;
  return FEATURE_FLAGS[flag];
}
