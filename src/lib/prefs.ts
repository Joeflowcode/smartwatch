export const PREFS_KEY = "ep_user_prefs";

export type OddsFormatPref = "american" | "decimal" | "fractional";

export type UserPrefs = {
  oddsFormat: OddsFormatPref;
  favoriteSports: string[];
  emailAlerts: boolean;
  aiHistoryDefault: boolean;
  alertFrequency: "low" | "normal" | "high";
};

export const DEFAULT_PREFS: UserPrefs = {
  oddsFormat: "american",
  favoriteSports: ["NBA", "NFL"],
  emailAlerts: true,
  aiHistoryDefault: false,
  alertFrequency: "normal",
};

export function readUserPrefs(): UserPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<UserPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeUserPrefs(prefs: UserPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
