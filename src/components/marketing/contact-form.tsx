"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { ContactSchema } from "@/lib/validation/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm" role="status">
        Thanks — your message was recorded for this demo. Connect Resend and a support inbox to
        deliver messages in production.
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
        track("contact_submitted", { source: "contact_form" });
        console.info("[contact]", {
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.message.slice(0, 120),
        });
        setSubmitted(true);
        setLoading(false);
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
