"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask about tonight’s slate, line moves, EV math, or bankroll sizing. I ground answers in available app data and will say when information is missing. I will not promise winners or help with illegal activity.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveHistory, setSaveHistory] = useState(false);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const result = (await response.json()) as {
      content?: string;
      citations?: string[];
      error?: string;
    };
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: result.content ?? result.error ?? "No response available.",
        citations: result.citations,
      },
    ]);
    setLoading(false);
    void saveHistory;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-3xl font-semibold">
          AI research assistant
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Factual data vs interpretation are separated. Timestamps and citations shown when available.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={saveHistory}
                onChange={(e) => setSaveHistory(e.target.checked)}
              />
              Save history (consent required — off by default in this demo)
            </label>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-lg border border-[var(--border)] p-4">
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-[var(--primary)]/10 p-3 text-sm"
                    : "mr-8 rounded-lg bg-[var(--muted)] p-3 text-sm whitespace-pre-wrap"
                }
              >
                {m.content}
                {m.citations?.length ? (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Citations: {m.citations.join(", ")} ·{" "}
                    {new Date().toLocaleString()}
                  </p>
                ) : null}
              </div>
            ))}
            {loading ? (
              <p className="animate-pulse-soft text-sm text-[var(--muted-foreground)]">
                Researching…
              </p>
            ) : null}
          </div>
          <form className="space-y-3" onSubmit={onSend}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Summarize tonight’s NBA slate and flag stale lines"
              rows={3}
            />
            <Button type="submit" disabled={loading}>
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
