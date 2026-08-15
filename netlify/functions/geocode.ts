import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const address = new URL(req.url).searchParams.get("address")?.trim();
  if (!address) {
    return Response.json({ error: "address required" }, { status: 400 });
  }

  try {
    const census = new URL(
      "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
    );
    census.searchParams.set("address", address);
    census.searchParams.set("benchmark", "Public_AR_Current");
    census.searchParams.set("format", "json");

    const response = await fetch(census);
    if (!response.ok) {
      return Response.json({ error: "geocoder unavailable" }, { status: 502 });
    }

    const data = (await response.json()) as {
      result?: {
        addressMatches?: Array<{
          matchedAddress?: string;
          coordinates?: { x: number; y: number };
        }>;
      };
    };
    const match = data.result?.addressMatches?.[0];
    if (!match?.coordinates) {
      return Response.json({ error: "no match" }, { status: 404 });
    }

    return Response.json({
      lat: match.coordinates.y,
      lng: match.coordinates.x,
      label: match.matchedAddress ?? address,
    });
  } catch {
    return Response.json({ error: "geocode failed" }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/geocode",
};
