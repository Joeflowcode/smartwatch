import { CATEGORIES, type CategoryId } from "../types";

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
