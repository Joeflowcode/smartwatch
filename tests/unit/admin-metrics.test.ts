import { describe, expect, it } from "vitest";
import { getAdminMetrics } from "@/lib/admin/metrics";

describe("getAdminMetrics", () => {
  it("returns demo placeholders without Supabase/Stripe", async () => {
    const metrics = await getAdminMetrics();
    expect(metrics.mode).toBe("demo");
    expect(metrics.mrrUsd).toBeNull();
    expect(metrics.notes.length).toBeGreaterThan(0);
  });
});
