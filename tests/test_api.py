"""API smoke tests for CouchHaul."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_score_endpoint():
    r = client.post(
        "/api/score",
        json={
            "listing": {
                "title": "Free couch",
                "description": "Nice fabric sofa",
                "price": 0,
                "free": True,
                "dimensions": {"length_in": 82, "depth_in": 36, "height_in": 33},
            },
            "gas_cost": 10,
            "cleaning_cost": 20,
            "labor_hours": 1,
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert "score" in body
    assert body["fit"]["fits"] is True


def test_index_served():
    r = client.get("/")
    assert r.status_code == 200
    assert "CouchHaul" in r.text
