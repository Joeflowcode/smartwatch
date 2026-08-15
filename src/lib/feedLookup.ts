export interface FeedQuery {
  zip?: string;
  city?: string;
  state?: string;
  start?: string;
  end?: string;
}

export const ZIP_LOOKUP_DISCONNECTED =
  "Licensed live feed is not connected. Set SALES_FEED_TEMPLATE or SALES_FEED_URL in Netlify env for ZIP lookup, or paste a list. This does not scrape EstateSales.net, Facebook, or Craigslist.";

export function digitsZip(value?: string): string {
  return (value ?? "").replace(/\D/g, "").slice(0, 5);
}

export function fillFeedTemplate(template: string, query: FeedQuery): string {
  const zip = digitsZip(query.zip);
  return template
    .replaceAll("{zip}", encodeURIComponent(zip))
    .replaceAll("{zip3}", encodeURIComponent(zip.slice(0, 3)))
    .replaceAll("{city}", encodeURIComponent((query.city ?? "").trim()))
    .replaceAll("{state}", encodeURIComponent((query.state ?? "").trim()))
    .replaceAll("{start}", encodeURIComponent(query.start ?? ""))
    .replaceAll("{end}", encodeURIComponent(query.end ?? ""));
}

export function templateNeedsZip(template: string): boolean {
  return template.includes("{zip}") || template.includes("{zip3}");
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "127.0.0.1" || host === "::1" || host === "[::1]") return true;
  if (host.endsWith(".internal") || host.endsWith(".local")) return true;
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host);
}

export function salesLookupPath(query: FeedQuery): string {
  const params = new URLSearchParams();
  const zip = digitsZip(query.zip);
  if (zip) params.set("zip", zip);
  if (query.city?.trim()) params.set("city", query.city.trim());
  if (query.state?.trim()) params.set("state", query.state.trim());
  if (query.start) params.set("start", query.start);
  if (query.end) params.set("end", query.end);
  const qs = params.toString();
  return qs ? `/api/sales?${qs}` : "/api/sales";
}
