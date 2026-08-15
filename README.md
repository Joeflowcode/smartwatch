# Weekend Sale Router

Phone-first web app that turns a weekend of estate sales (and garage/moving sales when you have that data) into a first → next → last driving order from your house.

Built for resellers and shoppers. Type a US start address — or use device location — pick a hunt list, and get a Saturday sweep that protects early closes.

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL (usually `http://localhost:5173`).

```bash
npm test          # routing, tags, hours, Maps URLs
npm run build     # production build
```

No accounts. No paid Google key. The ordered list is computed in the browser from coordinates + hours. Maps buttons are Google Maps driving deep links.

**Success check:** enter `1980 Madras St SE, Salem, OR 97306`, leave the date window on this weekend (Sat Aug 15–Sun Aug 16, 2026), tap **Electronics** and **Vintage**, then **Build route**. You should see a FIRST / NEXT / LAST Saturday list with inferred tags, close times, and working Maps links.

## Demo vs live data

This app talks to a **data adapter**. It does **not** scrape EstateSales.net, Facebook, or Craigslist.

| Source | What it is | When it is used |
| --- | --- | --- |
| **Bundled demo seed** | Real Salem, OR addresses for Sat Aug 15–Sun Aug 16, 2026 | Default. Works offline. |
| **Your pasted / uploaded JSON** | Sales you supply (name, address, lat/lng, hours, description) | When the paste box or file upload has a valid list |
| **Licensed live feed** | Stub only | Not connected. Partner API keys on EstateSales.net are for companies *posting* their own sales, not reading the national directory. |

Coordinates in the Salem seed were resolved with the public [US Census geocoder](https://geocoding.geo.census.gov/) for those exact addresses. Descriptions only use the facts in the seed brief. Category chips that come from title/description keywords are marked **inferred**.

A reviewer should treat the Salem weekend as **demo data**, not a live feed.

## Salem demo route (from 1980 Madras St SE)

Free-flow Saturday order the router is tested against:

1. Independence Pickin Sale — noon last day
2. Lion Heart — 1pm last day
3. All Things South
4. J House South
5. M&E huge
6. J House East
7. Fairgrounds flea

**All Things West** drops to the Sunday leftover list (open Sunday, off the Saturday sweep). **Half-day mode** skips Independence (noon close, 20+ minutes off the main cluster).

## How routing works

1. Filter by date window and hunt-list tags.
2. Saturday **morning musts** are sales that close by 2pm, visited in close-time order so a noon last-day stop is not buried behind a 5pm neighbor.
3. Remaining **last-day** stops are cheapest-inserted after those morning musts (never in front of a noon close).
4. Other Saturday stops insert next, earliest close first, so a 3–4pm sale claims a slot before a 6:30pm flea.
5. Two-day sales that sit opposite that last-day backbone become **Sunday leftover**.
6. Half-day mode drops a noon-close stop if it is 20+ minutes from the rest of the cluster.

Drive times are a free client-side estimate (haversine at urban speed). They do not require OSRM or a Google key.

## How to add a city

1. Copy `src/data/cities/salem-or.json` to `src/data/cities/<city>-<st>.json`.
2. Fill in real sale addresses only. Include `lat` / `lng` (Census geocoder or another public geocoder). Do not invent addresses.
3. Register the pack in `src/data/index.ts` (`CITY_PACKS`).
4. Add a test in `src/test/` if the city has a known drive order.

City packs are demo/seed files. They are not a live scrape. ZIP codes on the pack decide when the optional city/ZIP field selects that city.

## Paste format

```json
[
  {
    "name": "Example garage sale (labeled example)",
    "address": "350 Commercial St NE, Salem, OR 97301",
    "lat": 44.9412,
    "lng": -123.0395,
    "lastDay": false,
    "description": "Tools, records, and a stereo. Clearly labeled example.",
    "hours": [
      { "date": "2026-08-15", "open": "08:00", "close": "14:00" }
    ]
  }
]
```

See `src/data/examples/user-sales.example.json`. Hours can also be a string such as `Sat/Sun 9am–3pm`.

## Stack

- Vite + React + TypeScript
- Vitest for tagging and routing
- Netlify (`netlify.toml` + optional `/api/geocode` Census proxy for start addresses that are not in the seed)
- Phone-first CSS, no account system

## Deploy

Netlify build command `npm run build`, publish directory `dist`. SPA fallback is already in `netlify.toml`.
