import { CATEGORIES, type CategoryId, type RankedStop, type RoutePlan } from "../types";

export interface ShareState {
  address?: string;
  city?: string;
  zip?: string;
  categories?: CategoryId[];
  halfDay?: boolean;
  departAt?: string;
  feedUrl?: string;
}

const CAT_IDS = new Set<string>(CATEGORIES.map((category) => category.id));

export function parseShare(search: string): ShareState {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const cats = (params.get("cats") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is CategoryId => CAT_IDS.has(item));

  return {
    address: params.get("address") ?? undefined,
    city: params.get("city") ?? undefined,
    zip: params.get("zip") ?? undefined,
    categories: cats.length ? cats : undefined,
    halfDay: params.get("half") === "1" ? true : params.get("half") === "0" ? false : undefined,
    departAt: params.get("leave") ?? undefined,
    feedUrl: params.get("feed") ?? undefined,
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
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function shareUrl(origin: string, pathname: string, state: ShareState): string {
  return `${origin}${pathname}${buildShareSearch(state)}`;
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
