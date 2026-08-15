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

**Success check:** enter `1980 Madras St SE, Salem, OR 97306`, leave the date window on this weekend (Sat Aug 15–Sun Aug 16, 2026), tap **Electronics** and **Vintage**, then **Build route**. You should see a FIRST / NEXT / LAST Saturday list with inferred tags, arrival times, close times, and working Maps links. Sunday leftover has its own Maps link. **Skip** and **Start here** rebuild the rest of the sweep.

## Demo vs live data

This app talks to a **data adapter**. It does **not** scrape EstateSales.net, Facebook, or Craigslist.

| Source | What it is | When it is used |
| --- | --- | --- |
| **Bundled Salem seed** | Real Salem, OR addresses for Sat Aug 15–Sun Aug 16, 2026 | Default city pack. Works offline. |
| **Portland examples** | Real Portland streets, **labeled examples**, not this weekend’s sales | City pack chip “Portland, OR · examples” |
| **Your pasted / uploaded list** | Messy text, JSON, or a photo (on-device OCR) | When the paste box or file upload has a usable list |
| **JSON feed you host** | Same sale shape as paste. Optional `VITE_SALES_FEED_URL` or the feed URL field | When that URL returns sales. Same-origin `/feeds/example.json` is included. CORS failures go through `/api/feed` (https only). |

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

Drive times prefer the public OSRM table (road minutes). If that request fails, the app falls back to a crow-flies estimate. No Google key. The route banner says which one you got.

Photo upload now **shows the OCR text for edits** before it is added to your list. Add, replace, or discard.

## How to add a city

1. Copy `src/data/cities/salem-or.json` to `src/data/cities/<city>-<st>.json`.
2. Fill in real sale addresses only. Include `lat` / `lng` (Census geocoder or another public geocoder). Do not invent addresses.
3. Register the pack in `src/data/index.ts` (`CITY_PACKS`).
4. Add a test in `src/test/` if the city has a known drive order.

City packs are demo/seed files. They are not a live scrape. ZIP codes on the pack decide when the optional city/ZIP field selects that city. Set `kind` to `"seed"` for real weekend listings or `"example"` for clearly labeled examples.

Portland is the second pack: labeled examples on Census-geocoded streets (Hawthorne, 28th, Alberta, St Johns, Pearl). Not live inventory.

A second **real** weekend pack (Eugene/Springfield) was not added: only one this-weekend listing had a full public street address. The app will not invent the rest.

## Paste format

Messy notes work if each sale has a name, a US `street, city, ST ZIP` address, and Sat/Sun hours:

```
Independence Pickin Sale
115 S 6th St, Independence, OR 97351
Sat 9am-12pm LAST DAY

Lion Heart — 860 Salem Heights Ave S, Salem, OR 97302 — Sat 9am–1pm LAST DAY — antiques
```

JSON still works. `lat` / `lng` are optional when the address is already in a city pack (or when `/api/geocode` can resolve it). Hours can be a string such as `Sat/Sun 9am–3pm`.

See `src/data/examples/user-sales.example.json`.

The last start address, hunt chips, leave-at time, pasted list, and feed URL are saved in the browser (`localStorage`). **Copy share link** puts the hunt (not the pasted list) on the query string.

Photo upload uses Tesseract in the browser. It is best-effort; if OCR is empty, paste the text.

## JSON feed

Host an array of sales (or `{ "sales": [...] }`) and paste the URL, or set:

```bash
VITE_SALES_FEED_URL=/feeds/example.json
```

This is for a list you control or a future licensed dump. It is not a scrape of EstateSales.net, Facebook, or Craigslist.

## Stack

- Vite + React + TypeScript
- Vitest for tagging and routing
- Netlify (`netlify.toml`, `/api/geocode` Census proxy, `/api/feed` https proxy)
- Phone-first CSS, no account system

## Deploy

Netlify build command `npm run build`, publish directory `dist`. SPA fallback is already in `netlify.toml`.

```bash
npx netlify login
npx netlify deploy --dir=dist          # draft preview
npx netlify deploy --dir=dist --prod   # production
```

This cloud environment has no Netlify login, so a live preview URL has to be created from your machine or Netlify Git.
