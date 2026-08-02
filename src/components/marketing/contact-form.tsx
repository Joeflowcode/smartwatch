"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { ContactSchema } from "@/lib/validation/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm" role="status">
        {delivered
          ? "Thanks — your message was sent. We aim to respond within two business days."
          : "Thanks — your message was recorded for this demo. Add RESEND_API_KEY and CONTACT_INBOX to deliver email in production."}{" "}
        Or email{" "}
        <a className="underline" href="mailto:hello@edgepilot.ai">
          hello@edgepilot.ai
        </a>
        .
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const parsed = ContactSchema.safeParse({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Invalid form");
          setLoading(false);
          return;
        }
        void (async () => {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          });
          const result = (await response.json()) as {
            ok?: boolean;
            delivered?: boolean;
            error?: string;
          };
          setLoading(false);
          if (!response.ok) {
            setError(result.error ?? "Could not send message");
            return;
          }
          track("contact_submitted", { delivered: Boolean(result.delivered) });
          setDelivered(Boolean(result.delivered));
          setSubmitted(true);
        })();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} />
      </div>
      {error ? (
        <p className="text-sm text-[var(--destructive)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
