import type { LatLng } from "../types";

function encode(value: string): string {
  return encodeURIComponent(value);
}

export function placeQuery(label: string, coords?: LatLng): string {
  if (label.trim()) return label.trim();
  if (coords) return `${coords.lat},${coords.lng}`;
  return "";
}

export function stopMapsUrl(address: string, origin?: string): string {
  const params = new URLSearchParams({
    api: "1",
    destination: address,
    travelmode: "driving",
  });
  if (origin) params.set("origin", origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function routeMapsUrl(origin: string, stops: string[]): string | null {
  if (stops.length === 0) return null;
  if (stops.length === 1) return stopMapsUrl(stops[0], origin);

  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1);
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function geoLink(coords: LatLng, label: string): string {
  return `geo:${coords.lat},${coords.lng}?q=${encode(label)}`;
}
