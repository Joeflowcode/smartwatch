import { describe, expect, it } from "vitest";
import { ContactSchema } from "@/lib/validation/contact";

describe("contact form schema", () => {
  it("accepts valid input", () => {
    const parsed = ContactSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      message: "Interested in the beta for research tooling.",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short messages and bad emails", () => {
    expect(
      ContactSchema.safeParse({
        name: "Alex",
        email: "not-an-email",
        message: "too short",
      }).success,
    ).toBe(false);
  });

  it("rejects empty names", () => {
    expect(
      ContactSchema.safeParse({
        name: "   ",
        email: "alex@example.com",
        message: "Long enough message for contact.",
      }).success,
    ).toBe(false);
  });
});
