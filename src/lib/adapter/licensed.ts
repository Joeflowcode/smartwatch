import type { AdapterResult, HuntQuery, Sale } from "../../types";
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

export function licensedFeedAdapter(feedUrl?: string): SaleAdapter {
  const url = feedUrl?.trim() || envFeedUrl();

  return {
    id: "licensed-feed",
    label: "Licensed live feed",
    async load(query: HuntQuery): Promise<AdapterResult> {
      if (!url) {
        return {
          sales: [],
          source: "licensed-feed",
          note: "Licensed live feed is not connected. Set a feed URL or VITE_SALES_FEED_URL to a JSON list you host. EstateSales.net has no public read API — this does not scrape EstateSales.net, Facebook, or Craigslist.",
        };
      }

      try {
        const text = await readFeed(url);
        const weekend = weekendDates(query.windowStart, query.windowEnd);
        const parsed = await parseUserSalesAsync(text, weekend, {
          city: query.city,
          zip: query.zip,
        });
        const sales: Sale[] = parsed.sales.map((sale) => ({
          ...sale,
          source: "licensed-feed" as const,
        }));
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
