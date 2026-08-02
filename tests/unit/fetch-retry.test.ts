import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry } from "@/lib/http/fetch-retry";

describe("fetchWithRetry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    const res = await fetchWithRetry("https://example.com/x", { retries: 0 });
    expect(res.ok).toBe(true);
  });

  it("retries on 500 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("err", { status: 500 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchWithRetry("https://example.com/x", {
      retries: 1,
      retryDelayMs: 1,
    });
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
