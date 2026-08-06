"""CouchHaul FastAPI application."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from couchflip.inventory import InventoryStore
from couchflip.marketplace import build_search_links
from couchflip.models import (
    InventoryCreate,
    InventoryStatus,
    InventoryUpdate,
    ScoreRequest,
    SearchLinkRequest,
    TrailerConfig,
)
from couchflip.scoring import score_deal
from couchflip.trailer import trailer_capacity_summary

STATIC = Path(__file__).resolve().parents[1] / "static"
DEFAULT_CITY = os.getenv("COUCHHAUL_CITY", "Austin, TX")
INV_PATH = os.getenv("COUCHHAUL_INVENTORY")

app = FastAPI(
    title="CouchHaul",
    description="Score free/low-cost couches for flipping with a 16ft enclosed trailer.",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = InventoryStore(Path(INV_PATH) if INV_PATH else None)


@app.get("/api/health")
def health():
    return {"ok": True, "app": "CouchHaul", "default_city": DEFAULT_CITY}


@app.get("/api/trailer")
def trailer():
    return trailer_capacity_summary(TrailerConfig())


@app.post("/api/score")
def api_score(request: ScoreRequest):
    return score_deal(request)


@app.post("/api/search-links")
def api_search_links(request: SearchLinkRequest):
    return build_search_links(request)


@app.get("/api/search-links")
def api_search_links_get(
    location: str = Query(default=DEFAULT_CITY),
    max_price: float = Query(default=75, ge=0),
    free_only: bool = False,
    query: str = "couch",
    radius_miles: int = Query(default=40, ge=1, le=500),
):
    return build_search_links(
        SearchLinkRequest(
            location=location,
            max_price=max_price,
            free_only=free_only,
            query=query,
            radius_miles=radius_miles,
        )
    )


@app.get("/api/inventory")
def inventory_list(status: InventoryStatus | None = None):
    return {
        "items": [i.model_dump(mode="json") for i in store.list_items(status)],
        "summary": store.summary(),
    }


@app.post("/api/inventory")
def inventory_create(payload: InventoryCreate):
    item = store.create(payload)
    return item.model_dump(mode="json")


@app.patch("/api/inventory/{item_id}")
def inventory_update(item_id: str, payload: InventoryUpdate):
    item = store.update(item_id, payload)
    if not item:
        raise HTTPException(404, "Item not found")
    return item.model_dump(mode="json")


@app.delete("/api/inventory/{item_id}")
def inventory_delete(item_id: str):
    if not store.delete(item_id):
        raise HTTPException(404, "Item not found")
    return {"ok": True}


@app.get("/")
def index():
    index_path = STATIC / "index.html"
    if not index_path.exists():
        raise HTTPException(404, "Frontend not found")
    return FileResponse(index_path)


if STATIC.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")
