"""Unit tests for CouchHaul core logic."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from couchflip.marketplace import build_search_links
from couchflip.models import (
    Condition,
    CouchType,
    Dimensions,
    InventoryCreate,
    InventoryUpdate,
    ListingInput,
    Material,
    ScoreRequest,
    SearchLinkRequest,
    TrailerConfig,
)
from couchflip.inventory import InventoryStore
from couchflip.scoring import score_deal
from couchflip.trailer import check_fit, trailer_capacity_summary
from couchflip.valuation import estimate_resale


def test_sofa_fits_16ft_trailer():
    fit = check_fit(Dimensions(length_in=84, depth_in=38, height_in=34), CouchType.SOFA)
    assert fit.fits is True
    assert fit.orientation in {"lengthwise", "widthwise (rotated)"}


def test_sectional_fits_as_modules():
    fit = check_fit(
        Dimensions(length_in=120, depth_in=90, height_in=34, modular=True, pieces=3),
        CouchType.SECTIONAL,
    )
    assert fit.fits is True
    assert "module" in " ".join(fit.reasons).lower() or fit.orientation


def test_oversized_height_fails_door():
    fit = check_fit(
        Dimensions(length_in=84, depth_in=38, height_in=80),
        CouchType.SOFA,
    )
    assert fit.fits is False
    assert any("door" in r.lower() for r in fit.reasons)


def test_free_leather_sectional_scores_high():
    listing = ListingInput(
        title="Free Pottery Barn leather sectional",
        description="Moving, like new, 3 piece sectional, no pets",
        price=0,
        free=True,
        couch_type=CouchType.SECTIONAL,
        condition=Condition.EXCELLENT,
        material=Material.LEATHER,
        distance_miles=8,
        dimensions=Dimensions(length_in=110, depth_in=90, height_in=34, modular=True, pieces=3),
    )
    result = score_deal(ScoreRequest(listing=listing, gas_cost=10, cleaning_cost=30, labor_hours=2))
    assert result.fit.fits is True
    assert result.score >= 70
    assert result.estimated_profit_mid > 100
    assert result.grade in {"A", "B"}


def test_expensive_stained_sofa_scores_low():
    listing = ListingInput(
        title="Couch for sale stained",
        description="Has stains and pet hair, smoke smell",
        price=400,
        condition=Condition.POOR,
        pets_or_smoke=True,
        distance_miles=50,
        dimensions=Dimensions(length_in=84, depth_in=38, height_in=34),
    )
    result = score_deal(ScoreRequest(listing=listing))
    assert result.score < 55
    assert result.warnings


def test_valuation_premium_brand():
    listing = ListingInput(
        title="West Elm sofa",
        description="Fabric sofa good condition",
        price=50,
        condition=Condition.GOOD,
    )
    val = estimate_resale(listing)
    assert val.mid >= 150
    assert any("brand" in n.lower() or "West" in n or "west" in n for n in val.demand_notes + val.comps_used) or val.mid > 180


def test_search_links_facebook():
    links = build_search_links(
        SearchLinkRequest(location="Austin, TX", max_price=50, free_only=False)
    )
    assert links.facebook
    assert "facebook.com/marketplace" in links.facebook[0]["url"]
    assert "maxPrice=50" in links.facebook[0]["url"]


def test_search_links_free_only():
    links = build_search_links(
        SearchLinkRequest(location="Denver", max_price=100, free_only=True)
    )
    assert "maxPrice=0" in links.facebook[0]["url"]


def test_trailer_summary():
    summary = trailer_capacity_summary(TrailerConfig())
    assert summary["cargo_in"]["length"] == 192
    assert summary["floor_sqft"] > 90


def test_inventory_roundtrip(tmp_path):
    store = InventoryStore(tmp_path / "inv.json")
    item = store.create(
        InventoryCreate(
            listing=ListingInput(title="Test sofa", price=0, free=True),
            buy_price=0,
            score=80,
            grade="A",
            estimated_profit=200,
        )
    )
    assert store.get(item.id) is not None
    updated = store.update(
        item.id, InventoryUpdate(status="sold", sold_price=250)
    )
    assert updated is not None
    assert updated.actual_profit == 250
    assert store.summary()["sold_count"] == 1
    assert store.delete(item.id) is True
