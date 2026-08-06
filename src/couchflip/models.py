"""Shared data models for CouchHaul."""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class CouchType(str, Enum):
    LOVESEAT = "loveseat"
    SOFA = "sofa"
    SECTIONAL = "sectional"
    SLEEPER = "sleeper"
    RECLINER_SOFA = "recliner_sofa"
    CHAISE = "chaise"
    UNKNOWN = "unknown"


class Condition(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"


class Material(str, Enum):
    LEATHER = "leather"
    FAUX_LEATHER = "faux_leather"
    FABRIC = "fabric"
    VELVET = "velvet"
    MICROFIBER = "microfiber"
    UNKNOWN = "unknown"


class InventoryStatus(str, Enum):
    WATCHING = "watching"
    CONTACTED = "contacted"
    SCHEDULED = "scheduled"
    PICKED_UP = "picked_up"
    CLEANING = "cleaning"
    LISTED = "listed"
    SOLD = "sold"
    PASSED = "passed"


class TrailerConfig(BaseModel):
    """Usable cargo box of a 16ft enclosed trailer."""

    name: str = "16ft enclosed"
    length_in: float = 192.0
    width_in: float = 78.0
    height_in: float = 78.0
    door_width_in: float = 72.0
    door_height_in: float = 72.0
    # Keep a little aisle / strap room when packing multiple pieces
    packing_margin_in: float = 4.0


class Dimensions(BaseModel):
    length_in: Optional[float] = Field(None, ge=0, description="Longest side / width along wall")
    depth_in: Optional[float] = Field(None, ge=0, description="Front-to-back seat depth")
    height_in: Optional[float] = Field(None, ge=0, description="Floor to top of back")
    modular: bool = False
    pieces: int = Field(1, ge=1)


class ListingInput(BaseModel):
    title: str = ""
    description: str = ""
    price: float = Field(0, ge=0)
    city: str = ""
    distance_miles: Optional[float] = Field(None, ge=0)
    couch_type: CouchType = CouchType.UNKNOWN
    condition: Condition = Condition.UNKNOWN
    material: Material = Material.UNKNOWN
    brand_hint: str = ""
    dimensions: Dimensions = Field(default_factory=Dimensions)
    pets_or_smoke: bool = False
    free: bool = False
    url: Optional[str] = None
    notes: str = ""


class FitResult(BaseModel):
    fits: bool
    orientation: Optional[str] = None
    confidence: str = "medium"
    reasons: list[str] = Field(default_factory=list)
    tips: list[str] = Field(default_factory=list)
    estimated_footprint_sqft: Optional[float] = None


class ValuationResult(BaseModel):
    low: float
    mid: float
    high: float
    comps_used: list[str] = Field(default_factory=list)
    risk_flags: list[str] = Field(default_factory=list)
    demand_notes: list[str] = Field(default_factory=list)


class DealScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    grade: str
    estimated_profit_mid: float
    estimated_roi_pct: Optional[float] = None
    buy_price: float
    all_in_cost: float
    reasons: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    fit: FitResult
    valuation: ValuationResult
    recommended_list_price: float
    recommended_ask_price: float


class ScoreRequest(BaseModel):
    listing: ListingInput
    gas_cost: float = Field(0, ge=0)
    cleaning_cost: float = Field(25, ge=0)
    other_cost: float = Field(0, ge=0)
    labor_hours: float = Field(0, ge=0)
    labor_rate: float = Field(20, ge=0)
    trailer: TrailerConfig = Field(default_factory=TrailerConfig)


class SearchLinkRequest(BaseModel):
    location: str = Field(..., min_length=1, description="City or Marketplace location slug")
    max_price: float = 75
    query: str = "couch"
    radius_miles: int = 40
    days_since_listed: Optional[int] = 7
    free_only: bool = False


class SearchLinks(BaseModel):
    facebook: list[dict[str, str]]
    craigslist: list[dict[str, str]]
    tips: list[str]


class InventoryItem(BaseModel):
    id: str
    created_at: str
    updated_at: str
    status: InventoryStatus = InventoryStatus.WATCHING
    listing: ListingInput
    buy_price: float = 0
    all_in_cost: float = 0
    list_price: Optional[float] = None
    sold_price: Optional[float] = None
    score: Optional[int] = None
    grade: Optional[str] = None
    estimated_profit: Optional[float] = None
    actual_profit: Optional[float] = None
    marketplace_url: Optional[str] = None
    notes: str = ""


class InventoryCreate(BaseModel):
    listing: ListingInput
    status: InventoryStatus = InventoryStatus.WATCHING
    buy_price: float = 0
    all_in_cost: float = 0
    list_price: Optional[float] = None
    score: Optional[int] = None
    grade: Optional[str] = None
    estimated_profit: Optional[float] = None
    marketplace_url: Optional[str] = None
    notes: str = ""


class InventoryUpdate(BaseModel):
    status: Optional[InventoryStatus] = None
    buy_price: Optional[float] = None
    all_in_cost: Optional[float] = None
    list_price: Optional[float] = None
    sold_price: Optional[float] = None
    score: Optional[int] = None
    grade: Optional[str] = None
    estimated_profit: Optional[float] = None
    notes: Optional[str] = None
    marketplace_url: Optional[str] = None
    listing: Optional[ListingInput] = None
