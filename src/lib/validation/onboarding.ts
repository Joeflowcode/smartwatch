import { z } from "zod";

export const OnboardingSchema = z.object({
  displayName: z.string().min(1).max(80),
  country: z.string().min(2).max(80),
  region: z.string().max(80).optional().nullable(),
  timezone: z.string().min(1).max(80),
  favoriteSports: z.array(z.string()).max(12),
  preferredSportsbooks: z.array(z.string()).max(20),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  startingBankroll: z.number().nonnegative().nullable(),
  monthlyBudget: z.number().nonnegative().nullable(),
  isLegalAge: z.literal(true),
  responsibleUseAccepted: z.literal(true),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
