import { z } from "zod";

export const BankrollSchema = z.object({
  startingBankroll: z.number().nonnegative(),
  currentBankroll: z.number().nonnegative(),
  monthlyBudget: z.number().nonnegative().nullable(),
  maxStakePercent: z.number().positive().max(1),
  dailyLossLimit: z.number().nonnegative().nullable(),
  weeklyLossLimit: z.number().nonnegative().nullable(),
  kellyFraction: z.number().positive().max(1),
});

export type BankrollInput = z.infer<typeof BankrollSchema>;
