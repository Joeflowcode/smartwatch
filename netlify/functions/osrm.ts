import type { Config } from "@netlify/functions";

const OSRM_TABLE = "https://router.project-osrm.org/table/v1/driving";

export default async (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const coords = new URL(req.url).searchParams.get("coords")?.trim();
  if (!coords || !/^[-0-9.,;]+$/.test(coords)) {
    return Response.json({ error: "coords required" }, { status: 400 });
  }
  if (coords.split(";").length > 25) {
    return Response.json({ error: "too many points" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${OSRM_TABLE}/${coords}?annotations=duration`,
    );
    if (!response.ok) {
      return Response.json({ error: "osrm unavailable" }, { status: 502 });
    }
    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "osrm failed" }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/osrm",
};
