"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { SUGGESTED_PROMPTS } from "@/lib/ai/safety";
import { readUserPrefs } from "@/lib/prefs";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  at?: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Ask about tonight’s slate, line moves, EV math, or bankroll sizing. I ground answers in available app data and will say when information is missing. I will not promise winners or help with illegal activity.",
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { ...WELCOME, at: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveHistory, setSaveHistory] = useState(() =>
    typeof window === "undefined" ? false : readUserPrefs().aiHistoryDefault,
  );
  const [quota, setQuota] = useState<{ remaining?: number; limit?: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    setStarted(true);
    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        saveHistory,
      }),
    });
    const result = (await response.json()) as {
      content?: string;
      citations?: string[];
      error?: string;
      quota?: { remaining: number; limit: number };
    };

    if (result.quota) setQuota(result.quota);

    if (!response.ok) {
      setError(result.error ?? "Request failed");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: result.error ?? "I couldn’t process that request.",
          at: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: result.content ?? "No response available.",
          citations: result.citations,
          at: new Date().toISOString(),
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-24 sm:pb-6">
      <div>
        <h1 className="font-[family-name:var(--font-brand)] text-2xl font-semibold sm:text-3xl">
          AI research assistant
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Factual data vs interpretation are labeled. Press{" "}
          <kbd className="rounded border border-[var(--border)] px-1 text-xs">/</kbd> to focus.{" "}
          <Link href="/responsible-use" className="underline">
            Responsible use
          </Link>
          {quota.limit != null ? (
            <span className="ml-2">
              · {quota.remaining}/{quota.limit} questions left today
            </span>
          ) : null}
        </p>
      </div>

      {!started ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-4 py-5">
          <p className="text-sm font-medium">Try a grounded research prompt</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Answers cite mock or live provider data. Guarantees and match-fixing asks are refused.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void send(prompt)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-left text-xs leading-snug text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading}
              onClick={() => void send(prompt)}
              className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-left text-xs text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            >
              {prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt}
            </button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversation</CardTitle>
          <CardDescription>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={saveHistory}
                onChange={(e) => setSaveHistory(e.target.checked)}
              />
              Save history (consent required — persists only when Supabase is connected)
            </label>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border border-[var(--border)] p-3 sm:max-h-[480px] sm:p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={
                  m.role === "user"
                    ? "ml-6 rounded-lg bg-[var(--primary)]/10 p-3 text-sm sm:ml-8"
                    : "mr-6 rounded-lg bg-[var(--muted)] p-3 text-sm whitespace-pre-wrap sm:mr-8"
                }
              >
                {m.content}
                <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                  {m.role === "assistant" && m.citations?.length
                    ? `Citations: ${m.citations.join(", ")} · `
                    : ""}
                  {m.at ? new Date(m.at).toLocaleString() : ""}
                </p>
              </div>
            ))}
            {loading ? (
              <p className="animate-pulse-soft text-sm text-[var(--muted-foreground)]">
                Researching with available data…
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>
          {error ? (
            <p className="text-sm text-[var(--destructive)]" role="alert">
              {error}
            </p>
          ) : null}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a research question…"
              rows={3}
              className="text-base sm:text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? "Thinking…" : "Ask"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading || messages.length <= 1}
                onClick={() => {
                  setStarted(false);
                  setMessages([{ ...WELCOME, at: new Date().toISOString() }]);
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
