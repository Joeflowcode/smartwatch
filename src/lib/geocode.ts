import type { LatLng } from "../types";
import { CITY_PACKS } from "../data";

export function normalizeAddress(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\broad\b/g, "rd")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\s+/g, " ")
    .trim();
}

export function knownPoint(address: string): (LatLng & { label: string }) | null {
  const needle = normalizeAddress(address);
  if (!needle) return null;

  for (const pack of CITY_PACKS) {
    if (normalizeAddress(pack.defaultStart.label) === needle) {
      return { ...pack.defaultStart };
    }
    if (
      needle.startsWith(normalizeAddress(pack.defaultStart.label).slice(0, 18))
    ) {
      return { ...pack.defaultStart };
    }
    for (const sale of pack.sales) {
      if (normalizeAddress(sale.address) === needle) {
        return { lat: sale.lat, lng: sale.lng, label: sale.address };
      }
    }
  }
  return null;
}

export async function geocodeAddress(
  address: string,
): Promise<(LatLng & { label: string }) | null> {
  const known = knownPoint(address);
  if (known) return known;

  try {
    const response = await fetch(
      `/api/geocode?address=${encodeURIComponent(address)}`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      lat?: number;
      lng?: number;
      label?: string;
    };
    if (typeof data.lat === "number" && typeof data.lng === "number") {
      return {
        lat: data.lat,
        lng: data.lng,
        label: data.label || address,
      };
    }
  } catch {
    return null;
  }
  return null;
}
