import type { LatLng } from "../types";

const EARTH_MILES = 3958.8;
const URBAN_MPH = 18;
const DRIVE_PAD_MINUTES = 1.5;

export function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.sqrt(h));
}

export function driveMinutes(a: LatLng, b: LatLng): number {
  return (haversineMiles(a, b) / URBAN_MPH) * 60 + DRIVE_PAD_MINUTES;
}

export function toXY(point: LatLng, origin: LatLng): { x: number; y: number } {
  const x =
    (point.lng - origin.lng) *
    69 *
    Math.cos((origin.lat * Math.PI) / 180);
  const y = (point.lat - origin.lat) * 69;
  return { x, y };
}

export function angleDegrees(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  const du = Math.hypot(from.x, from.y);
  const dv = Math.hypot(to.x, to.y);
  if (du === 0 || dv === 0) return 0;
  const cos = Math.max(
    -1,
    Math.min(1, (from.x * to.x + from.y * to.y) / (du * dv)),
  );
  return (Math.acos(cos) * 180) / Math.PI;
}
