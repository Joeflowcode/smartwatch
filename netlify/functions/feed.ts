import type { Config } from "@netlify/functions";

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "127.0.0.1" || host === "::1" || host === "[::1]") return true;
  if (host.endsWith(".internal") || host.endsWith(".local")) return true;
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host);
}

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const raw = new URL(req.url).searchParams.get("url")?.trim();
  if (!raw) {
    return Response.json({ error: "url required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:") {
    return Response.json({ error: "https only" }, { status: 400 });
  }
  if (isBlockedHost(target.hostname)) {
    return Response.json({ error: "host not allowed" }, { status: 400 });
  }

  try {
    const response = await fetch(target, {
      headers: { Accept: "application/json,text/plain" },
    });
    if (!response.ok) {
      return Response.json({ error: "upstream error" }, { status: 502 });
    }
    const text = await response.text();
    if (text.length > 400_000) {
      return Response.json({ error: "feed too large" }, { status: 413 });
    }
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "feed fetch failed" }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/feed",
};
