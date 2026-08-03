export type FetchRetryOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  init?: RequestInit;
};

/**
 * fetch with AbortController timeout and exponential backoff on 429/5xx/network errors.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 8_000;
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 400;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options.init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(options.init?.headers ?? {}),
        },
      });
      clearTimeout(timer);

      if (response.ok) return response;

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === retries) {
        return response;
      }
      await sleep(retryDelayMs * 2 ** attempt);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === retries) throw error;
      await sleep(retryDelayMs * 2 ** attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetchWithRetry failed");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
