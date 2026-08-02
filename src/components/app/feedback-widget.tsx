"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"general" | "bug" | "feature" | "billing">("general");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [diagnostics, setDiagnostics] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const result = await submitFeedback({
      category,
      message,
      pagePath: pathname,
      satisfactionScore: score,
      collectDiagnostics: diagnostics,
      browserMeta: diagnostics
        ? {
            userAgent: navigator.userAgent,
            language: navigator.language,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          }
        : undefined,
    });
    setLoading(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setStatus(result.message);
    setMessage("");
    setScore(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--secondary-foreground)] shadow-lg lg:bottom-6"
        aria-label="Send feedback"
      >
        Feedback
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Beta feedback</h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Bugs, ideas, or friction — no pressure language, please.
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={(e) => void onSubmit(e)}>
              <div className="space-y-1">
                <Label htmlFor="fb-category">Type</Label>
                <select
                  id="fb-category"
                  className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as typeof category)
                  }
                >
                  <option value="general">General</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="billing">Billing</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fb-message">Message</Label>
                <Textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="What happened? What would help?"
                />
              </div>

              <div className="space-y-1">
                <Label>Optional satisfaction (1–5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      className={`h-9 w-9 rounded-md border text-sm ${
                        score === n
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  checked={diagnostics}
                  onChange={(e) => setDiagnostics(e.target.checked)}
                />
                Include browser diagnostics (user agent + viewport). Consent required.
              </label>

              <p className="text-[10px] text-[var(--muted-foreground)]">Page: {pathname}</p>

              {status ? <p className="text-sm text-[var(--primary)]">{status}</p> : null}

              <Button type="submit" className="w-full" disabled={loading || message.trim().length < 5}>
                {loading ? "Sending…" : "Send feedback"}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
