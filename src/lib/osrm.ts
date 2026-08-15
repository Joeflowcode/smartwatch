import type { LatLng } from "../types";
import { pointKey, type DriveMatrix } from "./distance";

const OSRM_TABLE = "https://router.project-osrm.org/table/v1/driving";

function uniquePoints(points: LatLng[]): LatLng[] {
  const seen = new Set<string>();
  const unique: LatLng[] = [];
  for (const point of points) {
    const key = pointKey(point);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(point);
  }
  return unique;
}

export function matrixFromTable(points: LatLng[], table: number[][]): DriveMatrix {
  const keys = points.map(pointKey);
  const lookup = new Map<string, number>();

  keys.forEach((from, i) => {
    keys.forEach((to, j) => {
      if (i === j) return;
      const seconds = table[i]?.[j];
      if (typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0) {
        lookup.set(`${from}|${to}`, seconds / 60);
      }
    });
  });

  return {
    source: "osrm",
    minutes(a, b) {
      return lookup.get(`${pointKey(a)}|${pointKey(b)}`) ?? null;
    },
  };
}

async function readTable(coordPath: string): Promise<number[][] | null> {
  const urls = [
    `${OSRM_TABLE}/${coordPath}?annotations=duration`,
    `/api/osrm?coords=${encodeURIComponent(coordPath)}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = (await response.json()) as { durations?: number[][] };
      if (Array.isArray(data.durations) && data.durations.length > 0) {
        return data.durations;
      }
    } catch {
      // try the next source
    }
  }
  return null;
}

export async function fetchOsrmMatrix(points: LatLng[]): Promise<DriveMatrix | null> {
  const unique = uniquePoints(points);
  if (unique.length < 2) return null;

  const coordPath = unique.map((point) => `${point.lng},${point.lat}`).join(";");
  const table = await readTable(coordPath);
  if (!table) return null;
  return matrixFromTable(unique, table);
}
