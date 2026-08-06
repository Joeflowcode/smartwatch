# CouchHaul

Score free and low-cost couches for flipping with a **16ft enclosed trailer**. Generate Facebook Marketplace & Craigslist hunt links, estimate resale and profit, check trailer fit, and track inventory from pickup to sale.

> Facebook does **not** offer a public Marketplace API. CouchHaul does **not** scrape Facebook. You open search links in your browser while logged in.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set COUCHHAUL_CITY to your area
uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000](http://localhost:8000).

## What it does

| Tab | Purpose |
|-----|---------|
| **Score a deal** | Paste a listing → grade (A–F), est. profit, resale range, 16ft trailer fit |
| **Hunt links** | One-click FB Marketplace + Craigslist searches for free / ≤$X couches |
| **Inventory** | Pipeline: watching → contacted → picked up → listed → sold (+ realized profit) |

### Trailer defaults (editable in code / API)

16ft enclosed cargo assumptions:

- Box: **192 × 78 × 78 in**
- Rear door: **72 × 72 in**
- Sectionals scored as modular pieces when possible

### Scoring inputs that matter

- Buy price (free is best)
- Condition, material, brand hints
- Dimensions (ask sellers for L×D×H)
- Distance, gas, cleaning, labor
- Pets/smoke and damage language in the description

## API

- `GET /api/health`
- `GET /api/trailer`
- `POST /api/score`
- `POST /api/search-links` / `GET /api/search-links?location=...`
- `GET|POST /api/inventory`
- `PATCH|DELETE /api/inventory/{id}`

## Tests

```bash
pytest -q
```

## Project layout

```
src/app.py              FastAPI entry
src/couchflip/          Scoring, trailer fit, valuation, links, inventory
static/                 Web UI
data/raw/inventory.json Saved deals (created at runtime)
tests/
```

## Flip playbook (short)

1. Set your city → **Hunt** → open Newest free/cheap couch searches.
2. Message fast; ask dimensions, smoke/pets, and whether sectionals separate.
3. **Score** before you drive; skip F/D or no-fit unless you can break it down.
4. Batch B+ pickups on one trailer run.
5. Clean, photo in good light, list at the suggested ask, track in **Inventory**.
