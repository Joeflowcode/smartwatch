import { CATEGORIES, type CategoryId, type RankedStop, type RoutePlan } from "../types";

export interface ShareState {
  address?: string;
  city?: string;
  zip?: string;
  categories?: CategoryId[];
  halfDay?: boolean;
  departAt?: string;
  feedUrl?: string;
  list?: string;
  host?: boolean;
  windowStart?: string;
  windowEnd?: string;
}

export const SHOPPER_URL_LIMIT = 7000;

export function encodeList(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeList(encoded: string): string | undefined {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return undefined;
  }
}

const CAT_IDS = new Set<string>(CATEGORIES.map((category) => category.id));

export function parseShare(search: string, hash = ""): ShareState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const cats = (params.get("cats") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is CategoryId => CAT_IDS.has(item));
  const listRaw = params.get("list") ?? hashParams.get("list");
  const list = listRaw ? decodeList(listRaw) : undefined;

  return {
    address: params.get("address") ?? undefined,
    city: params.get("city") ?? undefined,
    zip: params.get("zip") ?? undefined,
    categories: cats.length ? cats : undefined,
    halfDay: params.get("half") === "1" ? true : params.get("half") === "0" ? false : undefined,
    departAt: params.get("leave") ?? undefined,
    feedUrl: params.get("feed") ?? undefined,
    list,
    host: params.get("host") === "1" || Boolean(list && !params.get("address")),
    windowStart: params.get("from") ?? undefined,
    windowEnd: params.get("to") ?? undefined,
  };
}

export function buildShareSearch(state: ShareState): string {
  const params = new URLSearchParams();
  if (state.address) params.set("address", state.address);
  if (state.city) params.set("city", state.city);
  if (state.zip) params.set("zip", state.zip);
  if (state.categories?.length) params.set("cats", state.categories.join(","));
  if (state.halfDay) params.set("half", "1");
  if (state.departAt) params.set("leave", state.departAt);
  if (state.feedUrl) params.set("feed", state.feedUrl);
  if (state.host) params.set("host", "1");
  if (state.windowStart) params.set("from", state.windowStart);
  if (state.windowEnd) params.set("to", state.windowEnd);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function shareUrl(origin: string, pathname: string, state: ShareState): string {
  const hash = state.list?.trim() ? `#list=${encodeList(state.list.trim())}` : "";
  return `${origin}${pathname}${buildShareSearch(state)}${hash}`;
}

export function shopperUrl(
  origin: string,
  pathname: string,
  state: Pick<ShareState, "city" | "zip" | "windowStart" | "windowEnd" | "feedUrl" | "list">,
): { url: string } | { error: string } {
  const list = state.list?.trim();
  if (!list && !state.feedUrl) {
    return { error: "Paste a sale list (or a feed URL) before copying a shopper link." };
  }
  const url = shareUrl(origin, pathname, {
    city: state.city,
    zip: state.zip,
    windowStart: state.windowStart,
    windowEnd: state.windowEnd,
    feedUrl: state.feedUrl,
    list,
    host: true,
  });
  if (url.length > SHOPPER_URL_LIMIT) {
    return {
      error:
        "That list is too long for a link. Host it as JSON and put the feed URL in the paste box instead.",
    };
  }
  return { url };
}

function clockOf(stop: RankedStop): string {
  return (stop.arriveLabel ?? "").replace(/^Arrive\s+/i, "").trim();
}

function lineFor(stop: RankedStop): string {
  const clock = clockOf(stop);
  return clock ? `${stop.sale.name} ${clock}` : stop.sale.name;
}

export function formatRouteOneLiner(plan: RoutePlan): string {
  return plan.saturday
    .map((stop) => `${stop.role.toUpperCase()} ${lineFor(stop)}`)
    .join(" · ");
}

export function formatRouteText(
  plan: RoutePlan,
  options: { startLabel?: string; url?: string } = {},
): string {
  const lines: string[] = [];
  const oneLiner = formatRouteOneLiner(plan);
  if (oneLiner) lines.push(oneLiner);

  if (options.startLabel) {
    lines.push(`From ${options.startLabel}`);
  }

  for (const stop of plan.saturday) {
    const clock = clockOf(stop);
    const when = clock ? ` · ${clock}` : "";
    lines.push(`${stop.role.toUpperCase()} ${stop.sale.name}${when}`);
    lines.push(stop.sale.address);
  }

  if (plan.sunday.length > 0) {
    lines.push("");
    lines.push("Sunday leftover");
    for (const stop of plan.sunday) {
      lines.push(`${stop.sale.name} · ${stop.sale.address}`);
    }
  }

  if (options.url) {
    lines.push("");
    lines.push(options.url);
  }

  return lines.join("\n").trim();
}
