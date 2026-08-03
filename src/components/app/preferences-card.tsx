"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { SUPPORTED_SPORTS } from "@/config/site";
import {
  DEFAULT_PREFS,
  readUserPrefs,
  writeUserPrefs,
  type UserPrefs,
} from "@/lib/prefs";

function persist(next: UserPrefs) {
  writeUserPrefs(next);
  window.dispatchEvent(new Event("ep-prefs-changed"));
}

export function PreferencesCard() {
  const [prefs, setPrefs] = useState<UserPrefs>(readUserPrefs);
  const [saved, setSaved] = useState(false);

  function save(next: UserPrefs) {
    setPrefs(next);
    persist(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Stored in this browser until Supabase profile sync is connected. Odds format updates
          quotes across Odds, Scanner, and Games.
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
              save({ ...prefs, oddsFormat: e.target.value as UserPrefs["oddsFormat"] })
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
                      save({ ...prefs, favoriteSports });
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
              save({
                ...prefs,
                alertFrequency: e.target.value as UserPrefs["alertFrequency"],
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
            onChange={(e) => save({ ...prefs, emailAlerts: e.target.checked })}
          />
          Email alerts (when Resend is configured)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.aiHistoryDefault}
            onChange={(e) => save({ ...prefs, aiHistoryDefault: e.target.checked })}
          />
          Default AI history consent on
        </label>

        {saved ? <p className="text-xs text-[var(--primary)]">Saved</p> : null}
        <Button type="button" variant="outline" size="sm" onClick={() => save(DEFAULT_PREFS)}>
          Reset defaults
        </Button>
      </CardContent>
    </Card>
  );
}
