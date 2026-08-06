"""Trailer fit checks for a 16ft enclosed cargo trailer."""

from __future__ import annotations

from .models import CouchType, Dimensions, FitResult, TrailerConfig

# Typical sizes when listing omits dimensions (inches: L x D x H)
DEFAULT_SIZES: dict[CouchType, Dimensions] = {
    CouchType.LOVESEAT: Dimensions(length_in=62, depth_in=36, height_in=34),
    CouchType.SOFA: Dimensions(length_in=84, depth_in=38, height_in=34),
    CouchType.SECTIONAL: Dimensions(length_in=110, depth_in=90, height_in=34, modular=True, pieces=3),
    CouchType.SLEEPER: Dimensions(length_in=84, depth_in=38, height_in=36),
    CouchType.RECLINER_SOFA: Dimensions(length_in=88, depth_in=40, height_in=40),
    CouchType.CHAISE: Dimensions(length_in=60, depth_in=60, height_in=34),
    CouchType.UNKNOWN: Dimensions(length_in=84, depth_in=38, height_in=34),
}


def resolve_dimensions(dims: Dimensions, couch_type: CouchType) -> tuple[Dimensions, bool]:
    """Fill missing dims from type defaults. Returns (dims, used_defaults)."""
    defaults = DEFAULT_SIZES.get(couch_type, DEFAULT_SIZES[CouchType.UNKNOWN])
    used = False
    length = dims.length_in
    depth = dims.depth_in
    height = dims.height_in
    if length is None:
        length = defaults.length_in
        used = True
    if depth is None:
        depth = defaults.depth_in
        used = True
    if height is None:
        height = defaults.height_in
        used = True
    modular = dims.modular or defaults.modular
    pieces = max(dims.pieces, defaults.pieces if modular else 1)
    return (
        Dimensions(
            length_in=length,
            depth_in=depth,
            height_in=height,
            modular=modular,
            pieces=pieces,
        ),
        used,
    )


def _passes_door(length: float, depth: float, height: float, trailer: TrailerConfig) -> tuple[bool, str | None]:
    """Check whether the piece can clear the rear door in some orientation."""
    door_w = trailer.door_width_in
    door_h = trailer.door_height_in
    # Try each axis as the "through door" direction isn't needed; cross-section must fit door.
    candidates = [
        ("length-first", depth, height),
        ("depth-first", length, height),
        ("on-end", length, depth),
    ]
    for name, a, b in candidates:
        if (a <= door_w and b <= door_h) or (b <= door_w and a <= door_h):
            return True, name
    return False, None


def _fits_box(length: float, depth: float, height: float, trailer: TrailerConfig) -> tuple[bool, str | None]:
    """Check if piece fits inside cargo box in floor-plan orientations."""
    usable_l = trailer.length_in - trailer.packing_margin_in
    usable_w = trailer.width_in - trailer.packing_margin_in
    usable_h = trailer.height_in - trailer.packing_margin_in

    if height > usable_h:
        # Try laying on back/side only if height then fits width/length — rare for couches
        if depth <= usable_h and height <= usable_w:
            if length <= usable_l:
                return True, "on-side along length"
        return False, None

    if length <= usable_l and depth <= usable_w:
        return True, "lengthwise"
    if depth <= usable_l and length <= usable_w:
        return True, "widthwise (rotated)"
    return False, None


def check_fit(
    dims: Dimensions,
    couch_type: CouchType = CouchType.UNKNOWN,
    trailer: TrailerConfig | None = None,
) -> FitResult:
    trailer = trailer or TrailerConfig()
    resolved, used_defaults = resolve_dimensions(dims, couch_type)
    assert resolved.length_in and resolved.depth_in and resolved.height_in
    length, depth, height = resolved.length_in, resolved.depth_in, resolved.height_in

    reasons: list[str] = []
    tips: list[str] = []
    confidence = "high" if not used_defaults else "low"

    if used_defaults:
        reasons.append(
            f"Used typical {couch_type.value} size ~{int(length)}×{int(depth)}×{int(height)} in "
            "(listing missing dimensions)."
        )
        tips.append("Ask the seller for exact L×D×H before driving out.")

    door_ok, door_orient = _passes_door(length, depth, height, trailer)
    box_ok, box_orient = _fits_box(length, depth, height, trailer)

    if resolved.modular or couch_type == CouchType.SECTIONAL:
        tips.append("Sectionals: separate pieces at the connectors — load as modules.")
        # Conservative: assume largest module ~60% of listed length if one-piece dims given
        module_l = length / max(resolved.pieces, 2)
        module_d = min(depth, 40)
        door_ok_m, _ = _passes_door(module_l, module_d, height, trailer)
        box_ok_m, orient_m = _fits_box(module_l, module_d, height, trailer)
        if door_ok_m and box_ok_m:
            footprint = (length * depth) / 144.0
            return FitResult(
                fits=True,
                orientation=orient_m or "as modules",
                confidence=confidence,
                reasons=reasons
                + [
                    f"Should fit as ~{resolved.pieces} modules "
                    f"(~{int(module_l)}×{int(module_d)}×{int(height)} in each)."
                ],
                tips=tips
                + [
                    "Bring a ratchet strap set and furniture blankets.",
                    "Confirm pieces separate without cutting fabric/frames.",
                ],
                estimated_footprint_sqft=round(footprint, 1),
            )

    if not door_ok:
        reasons.append(
            f"Won't clear rear door ({int(trailer.door_width_in)}×{int(trailer.door_height_in)} in) "
            f"in any orientation."
        )
        tips.append("Skip unless seller will help disassemble legs/back.")
        return FitResult(
            fits=False,
            orientation=None,
            confidence=confidence,
            reasons=reasons,
            tips=tips,
            estimated_footprint_sqft=round((length * depth) / 144.0, 1),
        )

    if not box_ok:
        reasons.append(
            f"Clears door ({door_orient}) but exceeds cargo box "
            f"({int(trailer.length_in)}×{int(trailer.width_in)}×{int(trailer.height_in)} in usable)."
        )
        if couch_type == CouchType.SLEEPER:
            tips.append("Sleepers are heavy — even if it fits, plan 2 people + dollies.")
        return FitResult(
            fits=False,
            orientation=door_orient,
            confidence=confidence,
            reasons=reasons,
            tips=tips,
            estimated_footprint_sqft=round((length * depth) / 144.0, 1),
        )

    reasons.append(f"Fits door ({door_orient}) and box ({box_orient}).")
    if couch_type == CouchType.SLEEPER:
        tips.append("Sleeper sofas are heavy (200–300+ lb) — use appliance dolly + ramp.")
    if couch_type == CouchType.RECLINER_SOFA:
        tips.append("Secure reclining mechanisms; they shift in transit.")
    tips.append("Stand sofa on end only if fabric/legs allow — prefer upright on blankets.")

    return FitResult(
        fits=True,
        orientation=box_orient,
        confidence=confidence,
        reasons=reasons,
        tips=tips,
        estimated_footprint_sqft=round((length * depth) / 144.0, 1),
    )


def trailer_capacity_summary(trailer: TrailerConfig | None = None) -> dict:
    trailer = trailer or TrailerConfig()
    return {
        "name": trailer.name,
        "cargo_in": {
            "length": trailer.length_in,
            "width": trailer.width_in,
            "height": trailer.height_in,
        },
        "door_in": {
            "width": trailer.door_width_in,
            "height": trailer.door_height_in,
        },
        "floor_sqft": round((trailer.length_in * trailer.width_in) / 144.0, 1),
        "typical_load": "1 sectional (modular) or 2 sofas or 3 loveseats, with blankets/straps",
    }
