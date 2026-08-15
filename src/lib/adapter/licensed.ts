import type { AdapterResult, HuntQuery, Sale } from "../../types";
import { inferState } from "../geocode";
import { salesLookupPath, ZIP_LOOKUP_DISCONNECTED } from "../feedLookup";
import { weekendDates } from "../weekend";
import { parseUserSalesAsync } from "./user";
import type { SaleAdapter } from "./types";

function envFeedUrl(): string | undefined {
  const fromEnv = import.meta.env.VITE_SALES_FEED_URL;
  return typeof fromEnv === "string" && fromEnv.trim() ? fromEnv.trim() : undefined;
}

async function readFeed(url: string): Promise<string> {
  try {
    const direct = await fetch(url);
    if (direct.ok) return direct.text();
  } catch {
    // CORS or offline — try the same-origin proxy for absolute URLs
  }

  if (/^https?:\/\//i.test(url)) {
    const proxied = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
    if (!proxied.ok) {
      throw new Error(`Feed returned ${proxied.status}`);
    }
    return proxied.text();
  }

  throw new Error("Could not load that feed URL.");
}

async function salesFromBody(
  text: string,
  query: HuntQuery,
): Promise<Sale[]> {
  const weekend = weekendDates(query.windowStart, query.windowEnd);
  const parsed = await parseUserSalesAsync(text, weekend, {
    city: query.city,
    zip: query.zip,
    state: inferState(query.city, query.zip),
  });
  return parsed.sales.map((sale) => ({ ...sale, source: "licensed-feed" as const }));
}

async function loadZipLookup(query: HuntQuery): Promise<AdapterResult> {
  try {
    const response = await fetch(
      salesLookupPath({
        zip: query.zip,
        city: query.city,
        state: inferState(query.city, query.zip),
        start: query.windowStart,
        end: query.windowEnd,
      }),
    );
    if (!response.ok) {
      return {
        sales: [],
        source: "licensed-feed",
        note: ZIP_LOOKUP_DISCONNECTED,
      };
    }
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    if (!text.trim()) {
      return { sales: [], source: "licensed-feed", note: ZIP_LOOKUP_DISCONNECTED };
    }

    if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
      try {
        const meta = JSON.parse(text) as { connected?: boolean; sales?: unknown; note?: string };
        if (meta && meta.connected === false) {
          return {
            sales: [],
            source: "licensed-feed",
            note: typeof meta.note === "string" ? meta.note : ZIP_LOOKUP_DISCONNECTED,
          };
        }
      } catch {
        // parse as a sale list below
      }
    }

    const sales = await salesFromBody(text, query);
    return {
      sales,
      source: "licensed-feed",
      note:
        sales.length > 0
          ? `Loaded ${sales.length} sale${sales.length === 1 ? "" : "s"} for ZIP ${query.zip ?? "this area"} from the licensed feed. Not a directory scrape.`
          : `Licensed ZIP lookup ran for ${query.zip || query.city || "this area"} but returned no usable sales (need name, address, hours).`,
    };
  } catch {
    return {
      sales: [],
      source: "licensed-feed",
      note: ZIP_LOOKUP_DISCONNECTED,
    };
  }
}

export function licensedFeedAdapter(feedUrl?: string): SaleAdapter {
  const url = feedUrl?.trim() || envFeedUrl();

  return {
    id: "licensed-feed",
    label: "Licensed live feed",
    async load(query: HuntQuery): Promise<AdapterResult> {
      if (!url) return loadZipLookup(query);

      try {
        const text = await readFeed(url);
        const sales = await salesFromBody(text, query);
        return {
          sales,
          source: "licensed-feed",
          note:
            sales.length > 0
              ? `Loaded ${sales.length} sale${sales.length === 1 ? "" : "s"} from your feed URL. Not a directory scrape.`
              : "Feed loaded but had no usable sales (need name, address, hours).",
        };
      } catch (error) {
        return {
          sales: [],
          source: "licensed-feed",
          note: `Feed failed (${error instanceof Error ? error.message : "unknown error"}). Falling back to demo or pasted data.`,
        };
      }
    },
  };
}
