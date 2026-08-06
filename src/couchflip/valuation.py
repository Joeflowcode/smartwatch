"""Resale value heuristics for flipped couches."""

from __future__ import annotations

import re

from .models import Condition, CouchType, ListingInput, Material, ValuationResult

# Mid resale anchors (local FB Marketplace / Craigslist style, USD)
BASE_MID: dict[CouchType, float] = {
    CouchType.LOVESEAT: 120,
    CouchType.SOFA: 180,
    CouchType.SECTIONAL: 350,
    CouchType.SLEEPER: 200,
    CouchType.RECLINER_SOFA: 220,
    CouchType.CHAISE: 100,
    CouchType.UNKNOWN: 150,
}

CONDITION_MULT: dict[Condition, float] = {
    Condition.EXCELLENT: 1.25,
    Condition.GOOD: 1.0,
    Condition.FAIR: 0.7,
    Condition.POOR: 0.4,
    Condition.UNKNOWN: 0.85,
}

MATERIAL_MULT: dict[Material, float] = {
    Material.LEATHER: 1.45,
    Material.FAUX_LEATHER: 0.95,
    Material.VELVET: 1.15,
    Material.MICROFIBER: 1.0,
    Material.FABRIC: 1.0,
    Material.UNKNOWN: 1.0,
}

PREMIUM_BRANDS = [
    "pottery barn",
    "west elm",
    "restoration hardware",
    "rh ",
    "crate & barrel",
    "crate and barrel",
    "article",
    "cb2",
    "ethan allen",
    "room & board",
    "bassett",
    "thomasville",
    "ashley heritage",
    "leathercraft",
    "stressless",
    "lovesac",
]

MID_BRANDS = [
    "ashley",
    "ikea",
    "lazboy",
    "la-z-boy",
    "jonathan louis",
    "living spaces",
    "macy",
    "raymour",
    "havertys",
    "value city",
]

NEGATIVE_PATTERNS = [
    (r"\bstain(s|ed)?\b", "Stains mentioned — expect cleaning or discount"),
    (r"\btorn\b|\brip(s|ped)?\b|\bhole(s)?\b", "Damage to upholstery"),
    (r"\bpet(s)?\b|\bcat\b|\bdog\b|\bhair\b", "Pet history risk"),
    (r"\bsmoke[rd]?\b|\bcigarette\b", "Smoke odor risk — hard to flip"),
    (r"\bflea\b|\bbug\b|\bbed\s*bug\b", "Pest risk — skip"),
    (r"\bmold\b|\bmildew\b|\bwater\s*damage\b", "Moisture damage"),
    (r"\bfree\s*if\s*you\s*(haul|take)\b", "Haul-away freebie — often rough condition"),
]

POSITIVE_PATTERNS = [
    (r"\bmid[-\s]?century\b|\bmcm\b", "Mid-century style sells well"),
    (r"\bleather\b", "Leather commands premium if clean"),
    (r"\bsectional\b", "Sectionals have strong local demand"),
    (r"\blike\s*new\b|\bbarely\s*used\b|\bnw[ot]\b", "Near-new condition signal"),
    (r"\bmoving\b|\bmust\s*go\b|\bneed\s*gone\b", "Motivated seller — negotiate"),
]


def infer_type(text: str, fallback: CouchType) -> CouchType:
    if fallback != CouchType.UNKNOWN:
        return fallback
    t = text.lower()
    if "sectional" in t or "l-shape" in t or "l shape" in t:
        return CouchType.SECTIONAL
    if "sleeper" in t or "pullout" in t or "pull-out" in t or "sofa bed" in t:
        return CouchType.SLEEPER
    if "recliner" in t or "recling" in t:
        return CouchType.RECLINER_SOFA
    if "loveseat" in t or "love seat" in t:
        return CouchType.LOVESEAT
    if "chaise" in t:
        return CouchType.CHAISE
    if "sofa" in t or "couch" in t:
        return CouchType.SOFA
    return CouchType.UNKNOWN


def infer_material(text: str, fallback: Material) -> Material:
    if fallback != Material.UNKNOWN:
        return fallback
    t = text.lower()
    if "genuine leather" in t or re.search(r"\bleather\b", t):
        if "faux" in t or "vegan" in t or "bonded" in t or "pleather" in t:
            return Material.FAUX_LEATHER
        return Material.LEATHER
    if "velvet" in t:
        return Material.VELVET
    if "microfiber" in t or "microsuede" in t:
        return Material.MICROFIBER
    if "fabric" in t or "upholster" in t:
        return Material.FABRIC
    return Material.UNKNOWN


def _brand_multiplier(text: str) -> tuple[float, list[str]]:
    t = text.lower()
    notes: list[str] = []
    for brand in PREMIUM_BRANDS:
        if brand in t:
            notes.append(f"Premium brand signal: {brand.strip()}")
            return 1.6, notes
    for brand in MID_BRANDS:
        if brand in t:
            notes.append(f"Recognizable brand: {brand}")
            return 1.15, notes
    return 1.0, notes


def estimate_resale(listing: ListingInput) -> ValuationResult:
    text = f"{listing.title} {listing.description} {listing.brand_hint}".strip()
    couch_type = infer_type(text, listing.couch_type)
    material = infer_material(text, listing.material)
    condition = listing.condition

    mid = BASE_MID[couch_type]
    mid *= CONDITION_MULT[condition]
    mid *= MATERIAL_MULT[material]

    brand_mult, brand_notes = _brand_multiplier(text)
    mid *= brand_mult

    risk_flags: list[str] = []
    demand_notes: list[str] = list(brand_notes)
    comps: list[str] = [
        f"Base {couch_type.value}: ~${int(BASE_MID[couch_type])} mid",
        f"Condition ×{CONDITION_MULT[condition]:.2f}",
        f"Material ×{MATERIAL_MULT[material]:.2f}",
    ]

    for pattern, msg in NEGATIVE_PATTERNS:
        if re.search(pattern, text, re.I):
            risk_flags.append(msg)
            mid *= 0.85

    for pattern, msg in POSITIVE_PATTERNS:
        if re.search(pattern, text, re.I):
            demand_notes.append(msg)
            mid *= 1.05

    if listing.pets_or_smoke:
        risk_flags.append("Pets/smoke flagged by you — discount and deep-clean")
        mid *= 0.75

    if listing.free or listing.price == 0:
        demand_notes.append("Free pickup — margin is mostly your time + trailer run")

    # Free/cheap rough pieces still need a floor/ceiling
    low = max(25.0, mid * 0.7)
    high = mid * 1.35

    # Cap absurd highs for unknown poor pieces
    if condition == Condition.POOR:
        high = min(high, mid * 1.1)

    return ValuationResult(
        low=round(low, 0),
        mid=round(mid, 0),
        high=round(high, 0),
        comps_used=comps,
        risk_flags=risk_flags,
        demand_notes=demand_notes,
    )
