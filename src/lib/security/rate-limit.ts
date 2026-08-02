/**
 * Simple in-memory sliding-window rate limiter for route handlers.
 * Suitable for single-instance beta; replace with Redis for multi-instance.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true; remaining: number } | { ok: false; remaining: 0; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(options.key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < options.windowMs);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    buckets.set(options.key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, options.windowMs - (now - oldest)),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(options.key, bucket);
  return { ok: true, remaining: options.limit - bucket.timestamps.length };
}
