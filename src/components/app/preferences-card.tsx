"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { SUPPORTED_SPORTS } from "@/config/site";

const KEY = "ep_user_prefs";

type Prefs = {
  oddsFormat: "american" | "decimal" | "fractional";
  favoriteSports: string[];
  emailAlerts: boolean;
  aiHistoryDefault: boolean;
  alertFrequency: "low" | "normal" | "high";
};

const DEFAULTS: Prefs = {
  oddsFormat: "american",
  favoriteSports: ["NBA", "NFL"],
  emailAlerts: true,
  aiHistoryDefault: false,
  alertFrequency: "normal",
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Prefs) };
  } catch {
    return DEFAULTS;
  }
}

export function PreferencesCard() {
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [saved, setSaved] = useState(false);

  function persist(next: Prefs) {
    setPrefs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Stored in this browser until Supabase profile sync is connected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <Label htmlFor="odds-format">Odds format</Label>
          <select
            id="odds-format"
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3"
            value={prefs.oddsFormat}
            onChange={(e) =>
              persist({ ...prefs, oddsFormat: e.target.value as Prefs["oddsFormat"] })
            }
          >
            <option value="american">American</option>
            <option value="decimal">Decimal</option>
            <option value="fractional">Fractional</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Favorite sports</Label>
          <div className="flex flex-wrap gap-3">
            {SUPPORTED_SPORTS.map((sport) => {
              const checked = prefs.favoriteSports.includes(sport);
              return (
                <label key={sport} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const favoriteSports = checked
                        ? prefs.favoriteSports.filter((s) => s !== sport)
                        : [...prefs.favoriteSports, sport];
                      persist({ ...prefs, favoriteSports });
                    }}
                  />
                  {sport}
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alert-freq">Alert frequency</Label>
          <select
            id="alert-freq"
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3"
            value={prefs.alertFrequency}
            onChange={(e) =>
              persist({
                ...prefs,
                alertFrequency: e.target.value as Prefs["alertFrequency"],
              })
            }
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.emailAlerts}
            onChange={(e) => persist({ ...prefs, emailAlerts: e.target.checked })}
          />
          Email alerts (when Resend is configured)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.aiHistoryDefault}
            onChange={(e) => persist({ ...prefs, aiHistoryDefault: e.target.checked })}
          />
          Default AI history consent on
        </label>

        {saved ? <p className="text-xs text-[var(--primary)]">Saved</p> : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => persist(DEFAULTS)}
        >
          Reset defaults
        </Button>
      </CardContent>
    </Card>
  );
}
