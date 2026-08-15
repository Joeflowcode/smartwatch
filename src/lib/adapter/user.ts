import type { AdapterResult, HuntQuery, Sale } from "../../types";
import { inferTags } from "../tags";
import { parsePastedHours } from "../hours";
import { weekendDates } from "../weekend";
import { geocodeAddress, knownPoint } from "../geocode";
import {
  looksLikeJson,
  parseJsonSales,
  parseMessySales,
  type LooseSale,
} from "../parseList";
import type { SaleAdapter } from "./types";

function resolveCoords(raw: LooseSale): { lat: number; lng: number } | null {
  if (typeof raw.lat === "number" && typeof raw.lng === "number") {
    return { lat: raw.lat, lng: raw.lng };
  }
  if (!raw.address) return null;
  const known = knownPoint(raw.address);
  return known ? { lat: known.lat, lng: known.lng } : null;
}

function asSale(raw: LooseSale, index: number, weekend: string[]): Sale | null {
  if (!raw.name || !raw.address) return null;
  const coords = resolveCoords(raw);
  if (!coords) return null;

  const hours =
    typeof raw.hours === "string"
      ? parsePastedHours(raw.hours, weekend)
      : raw.hours ?? [];

  if (hours.length === 0) return null;

  const zipMatch = raw.address.match(/\b(\d{5})\b/);
  return {
    id: `user-${index}-${raw.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: raw.name,
    address: raw.address,
    city: raw.city ?? "",
    state: raw.state ?? "",
    zip: raw.zip ?? zipMatch?.[1] ?? "",
    lat: coords.lat,
    lng: coords.lng,
    hours,
    lastDay: Boolean(raw.lastDay),
    description: raw.description ?? "",
    tags: inferTags(`${raw.name} ${raw.description ?? ""}`),
    source: "user",
  };
}

export function parseLooseList(text: string, weekend: string[]): LooseSale[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (looksLikeJson(trimmed)) {
    try {
      return parseJsonSales(trimmed);
    } catch {
      return parseMessySales(trimmed, weekend);
    }
  }
  return parseMessySales(trimmed, weekend);
}

export function parseUserSales(text: string, weekend: string[]): Sale[] {
  return parseLooseList(text, weekend)
    .map((row, index) => asSale(row, index, weekend))
    .filter((sale): sale is Sale => Boolean(sale));
}

export async function parseUserSalesAsync(
  text: string,
  weekend: string[],
): Promise<Sale[]> {
  const rows = parseLooseList(text, weekend);
  const hydrated: LooseSale[] = [];

  for (const row of rows) {
    if (typeof row.lat === "number" && typeof row.lng === "number") {
      hydrated.push(row);
      continue;
    }
    if (!row.address) continue;
    const point = knownPoint(row.address) ?? (await geocodeAddress(row.address));
    if (!point) continue;
    hydrated.push({ ...row, lat: point.lat, lng: point.lng });
  }

  return hydrated
    .map((row, index) => asSale(row, index, weekend))
    .filter((sale): sale is Sale => Boolean(sale));
}

export function userAdapter(payload: string): SaleAdapter {
  return {
    id: "user",
    label: "Your pasted list",
    async load(query: HuntQuery): Promise<AdapterResult> {
      try {
        const weekend = weekendDates(query.windowStart, query.windowEnd);
        const sales = await parseUserSalesAsync(payload, weekend);
        return {
          sales,
          source: "user",
          note:
            sales.length > 0
              ? `Using ${sales.length} sale${sales.length === 1 ? "" : "s"} from your pasted list. Not live directory data.`
              : "Pasted list had no usable sales. Need a name, a US address, and hours (or Sat/Sun times).",
        };
      } catch {
        return {
          sales: [],
          source: "user",
          note: "Could not parse the pasted list. JSON or messy text both work.",
        };
      }
    },
  };
}
