"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";

const KEY = "ep_alert_rules";

export type AlertRule = {
  id: string;
  type: "target_odds" | "ev_threshold" | "line_move";
  label: string;
  threshold: number;
  channel: "in_app" | "email";
  active: boolean;
  createdAt: string;
};

function loadRules(): AlertRule[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as AlertRule[];
  } catch {
    return [];
  }
}

function saveRules(rules: AlertRule[]) {
  localStorage.setItem(KEY, JSON.stringify(rules));
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>(loadRules);
  const [type, setType] = useState<AlertRule["type"]>("ev_threshold");
  const [label, setLabel] = useState("");
  const [threshold, setThreshold] = useState(2);
  const [channel, setChannel] = useState<AlertRule["channel"]>("in_app");

  const activeCount = useMemo(() => rules.filter((r) => r.active).length, [rules]);

  function persist(next: AlertRule[]) {
    setRules(next);
    saveRules(next);
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    const rule: AlertRule = {
      id: crypto.randomUUID(),
      type,
      label: label.trim(),
      threshold,
      channel,
      active: true,
      createdAt: new Date().toISOString(),
    };
    persist([rule, ...rules]);
    setLabel("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
          Alerts
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {activeCount} active · stored on this device for now. Email delivery needs Resend.
          Rate limits apply — no spammy loss-chasing pings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create alert</CardTitle>
          <CardDescription>
            Thresholds are informational. We will never fake urgency or pressure larger bets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onAdd}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Celtics ML better than -135"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as AlertRule["type"])}
              >
                <option value="ev_threshold">EV threshold (%)</option>
                <option value="target_odds">Target American odds</option>
                <option value="line_move">Line move (points)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <select
                id="channel"
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                value={channel}
                onChange={(e) => setChannel(e.target.value as AlertRule["channel"])}
              >
                <option value="in_app">In-app</option>
                <option value="email">Email (when configured)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">
                Save alert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {rules.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          description="Create a threshold for EV, target odds, or line movement."
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <p className="font-medium">{rule.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {rule.type.replace("_", " ")} · {rule.threshold} · {rule.channel} ·{" "}
                    {rule.active ? "active" : "paused"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      persist(
                        rules.map((r) =>
                          r.id === rule.id ? { ...r, active: !r.active } : r,
                        ),
                      )
                    }
                  >
                    {rule.active ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => persist(rules.filter((r) => r.id !== rule.id))}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--muted-foreground)]">
        Prefer cool-off tools? Visit{" "}
        <Link href="/app/bankroll" className="underline">
          Bankroll
        </Link>{" "}
        or{" "}
        <Link href="/responsible-use" className="underline">
          Responsible use
        </Link>
        .
      </p>
    </div>
  );
}
