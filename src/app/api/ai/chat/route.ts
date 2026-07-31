import { NextResponse } from "next/server";
import { z } from "zod";
import { createAIProvider } from "@/lib/providers";

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
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const provider = createAIProvider();
    const result = await provider.chat({ messages: parsed.data.messages });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
