"""Deal scoring: profit + fit + risk → 0–100 grade."""

from __future__ import annotations

from .models import DealScore, ListingInput, ScoreRequest, TrailerConfig
from .trailer import check_fit
from .valuation import estimate_resale, infer_type


def _grade(score: int) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def score_deal(request: ScoreRequest) -> DealScore:
    listing = request.listing
    buy = 0.0 if listing.free else float(listing.price)
    labor = request.labor_hours * request.labor_rate
    all_in = buy + request.gas_cost + request.cleaning_cost + request.other_cost + labor

    valuation = estimate_resale(listing)
    couch_type = infer_type(
        f"{listing.title} {listing.description}", listing.couch_type
    )
    fit = check_fit(listing.dimensions, couch_type, request.trailer)

    profit_mid = valuation.mid - all_in
    profit_low = valuation.low - all_in
    roi = (profit_mid / all_in * 100.0) if all_in > 0 else None

    score = 50
    reasons: list[str] = []
    warnings: list[str] = []

    # Margin
    if profit_mid >= 250:
        score += 25
        reasons.append(f"Strong mid profit ~${int(profit_mid)}")
    elif profit_mid >= 150:
        score += 18
        reasons.append(f"Solid mid profit ~${int(profit_mid)}")
    elif profit_mid >= 75:
        score += 10
        reasons.append(f"OK mid profit ~${int(profit_mid)}")
    elif profit_mid >= 25:
        score += 3
        reasons.append(f"Thin mid profit ~${int(profit_mid)}")
    else:
        score -= 15
        warnings.append(f"Weak/negative mid profit ~${int(profit_mid)}")

    if profit_low < 0:
        score -= 8
        warnings.append("Downside case (low comps) may lose money")

    # Acquisition price
    if buy == 0:
        score += 12
        reasons.append("Free — best acquisition cost")
    elif buy <= 25:
        score += 8
        reasons.append(f"Very cheap buy at ${buy:g}")
    elif buy <= 75:
        score += 4
        reasons.append(f"Low buy at ${buy:g}")
    elif buy <= 150:
        score -= 2
    else:
        score -= 12
        warnings.append("Buy price is high for a flip — negotiate or pass")

    # Fit
    if fit.fits:
        score += 10
        reasons.append(f"Fits your {request.trailer.name} ({fit.orientation})")
    else:
        score -= 30
        warnings.append("Does not fit trailer — hard pass unless broken down")

    if fit.confidence == "low":
        score -= 5
        warnings.append("Fit confidence low — missing dimensions")

    # Risk
    score -= 4 * len(valuation.risk_flags)
    warnings.extend(valuation.risk_flags)

    if valuation.demand_notes:
        score += min(8, 2 * len(valuation.demand_notes))
        reasons.extend(valuation.demand_notes[:3])

    # Distance penalty
    if listing.distance_miles is not None:
        if listing.distance_miles > 45:
            score -= 10
            warnings.append(f"Far pickup ({listing.distance_miles:g} mi) eats margin")
        elif listing.distance_miles > 25:
            score -= 4
            warnings.append(f"Moderate drive ({listing.distance_miles:g} mi)")
        else:
            reasons.append(f"Nearby ({listing.distance_miles:g} mi)")

    score = int(max(0, min(100, score)))
    list_price = valuation.mid
    ask_price = round(valuation.mid * 1.1 / 5) * 5  # slightly above mid, $5 steps

    return DealScore(
        score=score,
        grade=_grade(score),
        estimated_profit_mid=round(profit_mid, 0),
        estimated_roi_pct=round(roi, 1) if roi is not None else None,
        buy_price=buy,
        all_in_cost=round(all_in, 2),
        reasons=reasons,
        warnings=warnings,
        fit=fit,
        valuation=valuation,
        recommended_list_price=list_price,
        recommended_ask_price=ask_price,
    )


def quick_score(
    title: str,
    price: float,
    *,
    description: str = "",
    free: bool = False,
    trailer: TrailerConfig | None = None,
) -> DealScore:
    listing = ListingInput(
        title=title,
        description=description,
        price=0 if free else price,
        free=free or price == 0,
    )
    return score_deal(
        ScoreRequest(listing=listing, trailer=trailer or TrailerConfig())
    )
