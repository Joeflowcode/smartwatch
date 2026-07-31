"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SUPPORTED_SPORTS } from "@/config/site";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLegalAge, setIsLegalAge] = useState(false);
  const [responsible, setResponsible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const underage = form.get("underage") === "yes";

    if (underage || !isLegalAge) {
      setError(
        "Betting-related analysis is unavailable to users who are under the legal gambling age.",
      );
      return;
    }
    if (!responsible) {
      setError("Please acknowledge responsible-use terms to continue.");
      return;
    }

    const sports = form.getAll("sports").map(String);
    const books = String(form.get("books") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const startingRaw = String(form.get("bankroll") ?? "");
    const budgetRaw = String(form.get("budget") ?? "");

    setLoading(true);
    const result = await completeOnboarding({
      displayName: String(form.get("displayName")),
      country: String(form.get("country")),
      region: String(form.get("region") || "") || null,
      timezone: String(form.get("timezone")),
      favoriteSports: sports,
      preferredSportsbooks: books,
      experienceLevel: String(form.get("experience")) as
        | "beginner"
        | "intermediate"
        | "advanced",
      startingBankroll: startingRaw ? Number(startingRaw) : null,
      monthlyBudget: budgetRaw ? Number(budgetRaw) : null,
      isLegalAge: true,
      responsibleUseAccepted: true,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    document.cookie = "ep_onboarded=1; path=/; max-age=31536000";
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Welcome — quick setup</CardTitle>
          <CardDescription>
            We collect only what we need for research preferences and compliance acknowledgments.
            With Supabase connected, this saves to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" name="displayName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Time zone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" placeholder="US" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">State / region</Label>
                <Input id="region" name="region" placeholder="Optional" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Favorite sports</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                {SUPPORTED_SPORTS.map((sport) => (
                  <label key={sport} className="flex items-center gap-2">
                    <input type="checkbox" name="sports" value={sport} defaultChecked />
                    {sport}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="books">Preferred sportsbooks</Label>
              <Input id="books" name="books" placeholder="DraftKings, FanDuel, …" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience level</Label>
              <select
                id="experience"
                name="experience"
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                defaultValue="intermediate"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankroll">Starting bankroll (optional)</Label>
                <Input id="bankroll" name="bankroll" type="number" min={0} step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly betting budget (optional)</Label>
                <Input id="budget" name="budget" type="number" min={0} step="0.01" />
              </div>
            </div>

            <fieldset className="space-y-3 rounded-lg border border-[var(--border)] p-4 text-sm">
              <legend className="px-1 font-medium">Legal age</legend>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isLegalAge}
                  onChange={(e) => setIsLegalAge(e.target.checked)}
                />
                <span>
                  I confirm I meet the legal gambling age in my location and will follow local law.
                </span>
              </label>
              <label className="flex items-start gap-2 text-[var(--muted-foreground)]">
                <input type="radio" name="underage" value="no" defaultChecked />
                I am of legal age
              </label>
              <label className="flex items-start gap-2 text-[var(--muted-foreground)]">
                <input type="radio" name="underage" value="yes" />
                I am under the legal gambling age
              </label>
            </fieldset>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={responsible}
                onChange={(e) => setResponsible(e.target.checked)}
              />
              <span>
                I understand EdgePilot AI does not accept wagers or guarantee outcomes, and I will
                not wager money I cannot afford to lose.
              </span>
            </label>

            {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Complete onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
