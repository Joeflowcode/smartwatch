import { Resend } from "resend";
import type { EmailProvider } from "@/lib/providers/types";
import { createMeta } from "@/lib/providers/types";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";
  private client: Resend;
  private from: string;

  constructor(apiKey: string, from = process.env.EMAIL_FROM ?? "EdgePilot AI <noreply@example.com>") {
    this.client = new Resend(apiKey);
    this.from = from;
  }

  async send(params: { to: string; subject: string; html: string }) {
    const result = await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      id: result.data?.id ?? "unknown",
      meta: createMeta(this.name, false),
    };
  }
}
