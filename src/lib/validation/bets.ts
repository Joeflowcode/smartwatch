import { z } from "zod";

export const BetSchema = z.object({
  sport: z.string().min(1).max(40),
  league: z.string().max(40).optional().nullable(),
  eventLabel: z.string().min(1).max(200),
  market: z.string().min(1).max(40),
  selection: z.string().min(1).max(120),
  sportsbook: z.string().min(1).max(80),
  americanOdds: z.number().int(),
  stake: z.number().positive(),
  notes: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string()).max(20).optional(),
});

export const BetStatusSchema = z.enum(["open", "won", "lost", "push", "void"]);

export type BetInput = z.infer<typeof BetSchema>;
