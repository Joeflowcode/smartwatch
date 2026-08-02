import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000),
});

export type ContactInput = z.infer<typeof ContactSchema>;
