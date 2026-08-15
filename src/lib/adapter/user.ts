import type { AdapterResult, HuntQuery, Sale, SaleHours } from "../../types";
import { inferTags } from "../tags";
import { parsePastedHours } from "../hours";
import { weekendDates } from "../weekend";
import type { SaleAdapter } from "./types";

interface LooseSale {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  lastDay?: boolean;
  description?: string;
  hours?: SaleHours[] | string;
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

export function parseUserSales(text: string, weekend: string[]): Sale[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parsed = JSON.parse(trimmed) as LooseSale[] | LooseSale;
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows
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
        const sales = parseUserSales(payload, weekend);
        return {
          sales,
          source: "user",
          note:
            sales.length > 0
              ? `Using ${sales.length} sale${sales.length === 1 ? "" : "s"} from your pasted list. Not live directory data.`
              : "Pasted list was empty or missing name, address, coordinates, or hours.",
        };
      } catch {
        return {
          sales: [],
          source: "user",
          note: "Could not parse the pasted list. Use the example JSON shape.",
        };
      }
    },
  };
}
