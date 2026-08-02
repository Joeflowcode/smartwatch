import { NextResponse } from "next/server";
import { APP_NAME } from "@/config/site";
import { createEmailProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/security/rate-limit";
import { ContactSchema } from "@/lib/validation/contact";

function resolveInbox(): string | null {
  if (process.env.CONTACT_INBOX) return process.env.CONTACT_INBOX;
  const from = process.env.EMAIL_FROM ?? "";
  const match = from.match(/<([^>]+)>/);
  if (match?.[1]) return match[1];
  if (from.includes("@")) return from.trim();
  return null;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const limited = rateLimit({ key: `contact:${ip}`, limit: 8, windowMs: 60 * 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 },
      );
    }

    const json = await request.json();
    const parsed = ContactSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid form" },
        { status: 400 },
      );
    }

    const inbox = resolveInbox();
    const provider = createEmailProvider();

    if (inbox && process.env.RESEND_API_KEY) {
      await provider.send({
        to: inbox,
        subject: `${APP_NAME} contact from ${parsed.data.name}`,
        html: `<p><strong>From:</strong> ${parsed.data.name} &lt;${parsed.data.email}&gt;</p><p>${parsed.data.message.replaceAll("\n", "<br/>")}</p>`,
      });
      return NextResponse.json({ ok: true, delivered: true });
    }

    console.info("[contact]", {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message.slice(0, 200),
    });
    return NextResponse.json({ ok: true, delivered: false });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
