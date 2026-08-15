import type { SaleHours } from "../types";
import { parsePastedHours } from "./hours";

export interface LooseSale {
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

const FULL_ADDRESS =
  /\d{1,6}\s+[^,\n]+,\s*[^,\n]+,\s*[A-Z]{2}(?:\s+\d{5}(?:-\d{4})?)?/i;

const STREET =
  /\d{1,6}\s+[A-Za-z0-9 .#'-]+?\s+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Court|Ct|Lane|Ln|Way|Boulevard|Blvd|Place|Pl|Terrace|Ter|Circle|Cir|Highway|Hwy|Parkway|Pkwy)\.?(?:\s+(?:N|S|E|W|NE|NW|SE|SW))?/i;

function cleanAddress(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[|—–]+$/g, "").trim();
}

export function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("[") || trimmed.startsWith("{");
}

export function extractAddress(text: string): string | undefined {
  const full = text.match(FULL_ADDRESS)?.[0];
  if (full) return cleanAddress(full);
  const street = text.match(STREET)?.[0];
  if (street) return cleanAddress(street);
  return undefined;
}

function splitParts(line: string): string[] {
  return line
    .split(/\s*[—|]\s*|\s+-{2,}\s*|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBlock(block: string, weekend: string[]): LooseSale | null {
  const compact = block.replace(/\s+/g, " ").trim();
  if (!compact) return null;

  const address = extractAddress(block);
  if (!address) return null;

  const lastDay = /last\s*day/i.test(block);
  const hours = parsePastedHours(block, weekend);
  const at = block.toLowerCase().indexOf(address.toLowerCase());
  const before = at >= 0 ? block.slice(0, at).trim() : "";
  const after = at >= 0 ? block.slice(at + address.length).trim() : "";

  let name = splitParts(before)[0] || before.split("\n")[0]?.trim() || "";
  name = name.replace(/[,:]+$/, "").trim();

  const descParts = after
    .split(/\n|(?:\s*[—|]\s*|\s+-{2,}\s*|\s+-\s+)/)
    .map((part) => part.trim())
    .filter(
      (part) =>
        part &&
        !extractAddress(part) &&
        !/^(sat|sun|last\s*day)/i.test(part) &&
        !/^\d{1,2}(?::\d{2})?\s*(am|pm)/i.test(part),
    );
  const description = descParts.join(", ");

  if (!name) {
    const firstLine = block.split("\n")[0]?.trim() ?? "";
    name = extractAddress(firstLine) ? address : firstLine;
  }

  const zip = address.match(/\b(\d{5})\b/)?.[1];
  const cityState = address.match(/,\s*([^,]+),\s*([A-Z]{2})(?:\s+\d{5})?/i);

  return {
    name,
    address,
    city: cityState?.[1]?.trim(),
    state: cityState?.[2]?.toUpperCase(),
    zip,
    lastDay,
    description,
    hours: hours.length > 0 ? hours : weekend[0]
      ? [{ date: weekend[0], open: "09:00", close: "15:00" }]
      : [],
  };
}

export function parseMessySales(text: string, weekend: string[]): LooseSale[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const blocks = trimmed
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const fromBlocks = blocks
    .map((block) => parseBlock(block, weekend))
    .filter((sale): sale is LooseSale => Boolean(sale));

  if (fromBlocks.length > 0) return fromBlocks;

  const fromLines = trimmed
    .split("\n")
    .map((line) => parseBlock(line, weekend))
    .filter((sale): sale is LooseSale => Boolean(sale));

  return fromLines;
}

export function parseJsonSales(text: string): LooseSale[] {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return parsed as LooseSale[];
  if (parsed && typeof parsed === "object" && "sales" in parsed) {
    const sales = (parsed as { sales: unknown }).sales;
    if (Array.isArray(sales)) return sales as LooseSale[];
  }
  return [parsed as LooseSale];
}
