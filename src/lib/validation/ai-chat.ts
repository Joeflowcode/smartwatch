import { z } from "zod";

export const AiChatBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1).max(8000),
    }),
  ),
  /** When true and Supabase is connected, persist the turn. Default false. */
  saveHistory: z.boolean().optional().default(false),
});

export type AiChatBody = z.infer<typeof AiChatBodySchema>;
