import type { LatLng } from "../types";
import { CITY_PACKS, findCityPack } from "../data";

export interface AddressHint {
  city?: string;
  state?: string;
  zip?: string;
}

export function inferState(city?: string, zip?: string): string | undefined {
  return findCityPack(city, zip)?.state;
}

export function hintFromHunt(city?: string, zip?: string): AddressHint {
  return {
    city: city?.trim() || undefined,
    zip: zip?.trim() || undefined,
    state: inferState(city, zip),
  };
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function completeAddress(address: string, hint: AddressHint = {}): string {
  const compact = address.replace(/\s+/g, " ").trim();
  if (!compact) return compact;

  const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(compact);
  const hasState = /,\s*[A-Z]{2}\b/i.test(compact) || /\s[A-Z]{2}\s+\d{5}/i.test(compact);
  const city = hint.city?.trim();
  const state = hint.state?.trim().toUpperCase();
  const zip = hint.zip?.trim();
  const hasCity = city
    ? new RegExp(`\\b${escapeRe(city)}\\b`, "i").test(compact)
    : false;

  let next = compact;
  if (city && !hasCity) next += `, ${city}`;
  if (state && !hasState) next += `, ${state}`;
  if (zip && !hasZip) next += ` ${zip}`;
  return next.replace(/\s*,\s*,/g, ",").replace(/\s+/g, " ").trim();
}

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
      const saleNorm = normalizeAddress(sale.address);
      if (saleNorm === needle) {
        return { lat: sale.lat, lng: sale.lng, label: sale.address };
      }
      if (needle.length >= 8 && saleNorm.startsWith(`${needle} `)) {
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
