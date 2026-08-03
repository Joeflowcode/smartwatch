"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";

export function GameNotes({ eventId }: { eventId: string }) {
  const key = `ep_game_notes:${eventId}`;
  const [notes, setNotes] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key) ?? "";
  });
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your notes</CardTitle>
        <CardDescription>Private to this browser until account sync is connected</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Matchup thoughts, questions to revisit, risk flags…"
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              localStorage.setItem(key, notes);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 1200);
            }}
          >
            Save notes
          </Button>
          {saved ? <span className="text-xs text-[var(--primary)]">Saved</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
