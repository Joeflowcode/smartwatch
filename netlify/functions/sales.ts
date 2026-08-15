import type { Config } from "@netlify/functions";
import {
  ZIP_LOOKUP_DISCONNECTED,
  digitsZip,
  fillFeedTemplate,
  isBlockedHost,
  templateNeedsZip,
} from "../../src/lib/feedLookup";

function envGet(name: string): string | undefined {
  try {
    const value = Netlify.env.get(name)?.trim();
    if (value) return value;
  } catch {
    // local tests may not inject Netlify.env
  }
  return undefined;
}

function disconnected() {
  return Response.json({
    connected: false,
    sales: [],
    note: ZIP_LOOKUP_DISCONNECTED,
  });
}

function authHeaders(): HeadersInit {
  const token = envGet("SALES_FEED_TOKEN");
  if (!token) return { Accept: "application/json,text/plain" };
  const header = envGet("SALES_FEED_HEADER") || "Authorization";
  const value =
    header.toLowerCase() === "authorization" && !/^(Bearer|Basic)\s/i.test(token)
      ? `Bearer ${token}`
      : token;
  return {
    Accept: "application/json,text/plain",
    [header]: value,
  };
}

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const template = envGet("SALES_FEED_TEMPLATE") || envGet("SALES_FEED_URL");
  if (!template) return disconnected();

  const params = new URL(req.url).searchParams;
  const zip = digitsZip(params.get("zip") ?? "");
  const city = params.get("city")?.trim() ?? "";
  const state = params.get("state")?.trim() ?? "";
  const start = params.get("start")?.trim() ?? "";
  const end = params.get("end")?.trim() ?? "";

  if (templateNeedsZip(template) && zip.length !== 5) {
    return Response.json({
      connected: true,
      sales: [],
      note: "Enter a 5-digit ZIP to look up the licensed feed for that area.",
    });
  }

  const filled = fillFeedTemplate(template, { zip, city, state, start, end });

  let target: URL;
  try {
    target = new URL(filled);
  } catch {
    return Response.json({ error: "partner url invalid" }, { status: 500 });
  }

  if (target.protocol !== "https:") {
    return Response.json({ error: "https only" }, { status: 500 });
  }
  if (isBlockedHost(target.hostname)) {
    return Response.json({ error: "host not allowed" }, { status: 500 });
  }

  try {
    const response = await fetch(target, { headers: authHeaders() });
    if (!response.ok) {
      return Response.json({
        connected: true,
        sales: [],
        note: `Licensed feed returned ${response.status} for ZIP ${zip || "unknown"}.`,
      });
    }
    const text = await response.text();
    if (text.length > 400_000) {
      return Response.json({ error: "feed too large" }, { status: 413 });
    }
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json({
      connected: true,
      sales: [],
      note: "Licensed feed could not be reached. Paste a list or try again later.",
    });
  }
};

export const config: Config = {
  path: "/api/sales",
};
