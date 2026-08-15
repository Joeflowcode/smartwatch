import type { AdapterResult, HuntQuery, Sale } from "../../types";
import { inferTags } from "../tags";
import { parsePastedHours } from "../hours";
import { weekendDates } from "../weekend";
import {
  completeAddress,
  geocodeAddress,
  hintFromHunt,
  knownPoint,
  type AddressHint,
} from "../geocode";
import {
  looksLikeJson,
  parseJsonSales,
  parseMessySales,
  type LooseSale,
} from "../parseList";
import type { SaleAdapter } from "./types";

export interface ParsedUserList {
  sales: Sale[];
  missed: string[];
  geocoded: number;
}

function asSale(raw: LooseSale, index: number, weekend: string[]): Sale | null {
  if (!raw.name || !raw.address) return null;
  if (typeof raw.lat !== "number" || typeof raw.lng !== "number") return null;

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
    lat: raw.lat,
    lng: raw.lng,
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

function pinFromSeed(address: string, hint: AddressHint) {
  return knownPoint(address) ?? knownPoint(completeAddress(address, hint));
}

export function parseUserSales(
  text: string,
  weekend: string[],
  hint: AddressHint = {},
): Sale[] {
  return parseLooseList(text, weekend)
    .map((row, index) => {
      if (typeof row.lat === "number" && typeof row.lng === "number") {
        return asSale(row, index, weekend);
      }
      if (!row.address) return null;
      const point = pinFromSeed(row.address, hint);
      if (!point) return null;
      return asSale({ ...row, address: point.label, lat: point.lat, lng: point.lng }, index, weekend);
    })
    .filter((sale): sale is Sale => Boolean(sale));
}

export async function parseUserSalesAsync(
  text: string,
  weekend: string[],
  hint: AddressHint = {},
): Promise<ParsedUserList> {
  const rows = parseLooseList(text, weekend);
  const sales: Sale[] = [];
  const missed: string[] = [];
  let geocoded = 0;

  for (const [index, row] of rows.entries()) {
    if (typeof row.lat === "number" && typeof row.lng === "number") {
      const sale = asSale(row, index, weekend);
      if (sale) sales.push(sale);
      continue;
    }
    if (!row.address) {
      if (row.name) missed.push(row.name);
      continue;
    }

    const seed = pinFromSeed(row.address, hint);
    if (seed) {
      const sale = asSale(
        { ...row, address: seed.label, lat: seed.lat, lng: seed.lng },
        index,
        weekend,
      );
      if (sale) sales.push(sale);
      continue;
    }

    const completed = completeAddress(row.address, hint);
    const point = await geocodeAddress(completed);
    if (!point) {
      missed.push(row.name || row.address);
      continue;
    }
    geocoded += 1;
    const sale = asSale(
      { ...row, address: point.label || completed, lat: point.lat, lng: point.lng },
      index,
      weekend,
    );
    if (sale) sales.push(sale);
    else missed.push(row.name || row.address);
  }

  return { sales, missed, geocoded };
}

function listNote(result: ParsedUserList): string {
  if (result.sales.length === 0) {
    const missed =
      result.missed.length > 0
        ? ` Could not place: ${result.missed.join("; ")}.`
        : "";
    return `Pasted list had no usable sales. Need a name, a US street, and hours (or Sat/Sun times).${missed}`;
  }

  const parts = [
    `Using ${result.sales.length} sale${result.sales.length === 1 ? "" : "s"} from your pasted list.`,
  ];
  if (result.geocoded > 0) {
    parts.push(
      `Census filled ${result.geocoded} missing pin${result.geocoded === 1 ? "" : "s"}.`,
    );
  }
  if (result.missed.length > 0) {
    parts.push(`Could not place: ${result.missed.join("; ")}.`);
  }
  parts.push("Not live directory data.");
  return parts.join(" ");
}

export function userAdapter(payload: string): SaleAdapter {
  return {
    id: "user",
    label: "Your pasted list",
    async load(query: HuntQuery): Promise<AdapterResult> {
      try {
        const weekend = weekendDates(query.windowStart, query.windowEnd);
        const result = await parseUserSalesAsync(
          payload,
          weekend,
          hintFromHunt(query.city, query.zip),
        );
        return {
          sales: result.sales,
          source: "user",
          note: listNote(result),
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
