import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit and blocks after", () => {
    const key = `test-${Math.random()}`;
    const first = rateLimit({ key, limit: 2, windowMs: 60_000 });
    const second = rateLimit({ key, limit: 2, windowMs: 60_000 });
    const third = rateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
    if (!third.ok) {
      expect(third.retryAfterMs).toBeGreaterThan(0);
    }
  });
});
