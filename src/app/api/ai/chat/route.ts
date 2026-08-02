import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAiQuota } from "@/app/actions/entitlements";
import { getSessionUser } from "@/lib/auth/session";
import { createAIProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1).max(8000),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit({
      key: `ai:${user.id}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a moment." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
        },
      );
    }

    const quota = await checkAiQuota();
    if (!quota.ok) {
      return NextResponse.json({ error: quota.error }, { status: 402 });
    }

    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const provider = createAIProvider();
    const result = await provider.chat({ messages: parsed.data.messages });

    // Persist usage for live users when history consent is later enabled; count for quota now.
    if (!user.isDemo) {
      const supabase = await createClient();
      if (supabase) {
        const { data: conversation } = await supabase
          .from("ai_conversations")
          .insert({ user_id: user.id, title: "Research chat" })
          .select("id")
          .single();

        if (conversation) {
          const lastUser = [...parsed.data.messages].reverse().find((m) => m.role === "user");
          if (lastUser) {
            await supabase.from("ai_messages").insert([
              {
                conversation_id: conversation.id,
                role: "user",
                content: lastUser.content,
              },
              {
                conversation_id: conversation.id,
                role: "assistant",
                content: result.content,
                citations: result.citations,
              },
            ]);
          }
        }
      }
    }

    return NextResponse.json({
      ...result,
      quota: { remaining: Math.max(0, quota.remaining - 1), limit: quota.limit },
    });
  } catch {
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
