import { describe, expect, it } from "vitest";
import { routeMapsUrl, stopMapsUrl } from "../lib/maps";

describe("maps links", () => {
  const origin = "1980 Madras St SE, Salem, OR 97306";
  const stops = [
    "115 S 6th St, Independence, OR 97351",
    "860 Salem Heights Ave S, Salem, OR 97302",
    "4182 Barrett St S, Salem, OR 97302",
  ];

  const decode = (url: string) => decodeURIComponent(url.replace(/\+/g, " "));

  it("builds a single-stop driving link", () => {
    const url = stopMapsUrl(stops[0], origin);
    expect(url.startsWith("https://www.google.com/maps/dir/?")).toBe(true);
    expect(url).toContain("travelmode=driving");
    expect(decode(url)).toContain(stops[0]);
    expect(decode(url)).toContain(origin);
  });

  it("puts the last stop in destination and the rest in waypoints", () => {
    const url = routeMapsUrl(origin, stops);
    expect(url).toBeTruthy();
    const decoded = decode(url!);
    expect(decoded).toContain(`origin=${origin}`);
    expect(decoded).toContain(`destination=${stops[2]}`);
    expect(decoded).toContain(`${stops[0]}|${stops[1]}`);
  });
});
