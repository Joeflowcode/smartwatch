import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-brand)] text-4xl font-semibold tracking-tight">
        Contact
      </h1>
      <p className="mt-3 text-[var(--muted-foreground)]">
        Beta support, partnership, and press inquiries. We aim to respond within two business days.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
