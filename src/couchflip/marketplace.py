"""Generate Marketplace / Craigslist search links (no scraping)."""

from __future__ import annotations

from urllib.parse import quote_plus, urlencode

from .models import SearchLinkRequest, SearchLinks


def _fb_location_slug(location: str) -> str:
    """Best-effort slug; Facebook also accepts numeric place IDs."""
    slug = location.strip().lower()
    slug = slug.replace(",", " ").replace(".", " ")
    parts = [p for p in slug.split() if p]
    return "-".join(parts) if parts else "you"


def facebook_links(req: SearchLinkRequest) -> list[dict[str, str]]:
    loc = _fb_location_slug(req.location)
    max_price = 0 if req.free_only else int(req.max_price)
    queries = []

    base_q = req.query.strip() or "couch"
    variants = [
        (base_q, f"{base_q.title()} ≤ ${max_price}" if not req.free_only else "Free couches"),
        ("sectional", "Sectionals"),
        ("free couch", "Free couch wording"),
        ("free sofa", "Free sofa wording"),
        ("moving couch", "Moving / must-go couches"),
        ("leather sofa", "Leather sofas"),
    ]

    links: list[dict[str, str]] = []
    for q, label in variants:
        params = {
            "query": q,
            "exact": "false",
        }
        if req.free_only:
            params["minPrice"] = "0"
            params["maxPrice"] = "0"
        else:
            params["minPrice"] = "0"
            params["maxPrice"] = str(max_price)
        if req.days_since_listed:
            params["daysSinceListed"] = str(int(req.days_since_listed))
        # radius is set in FB UI; include as tip. Some locales honor scale.
        url = f"https://www.facebook.com/marketplace/{quote_plus(loc)}/search?{urlencode(params)}"
        links.append({"label": label, "url": url, "source": "facebook"})

    # Category browse
    cat_params = {"query": base_q}
    if not req.free_only:
        cat_params["maxPrice"] = str(max_price)
        cat_params["minPrice"] = "0"
    links.append(
        {
            "label": "Furniture category browse",
            "url": f"https://www.facebook.com/marketplace/{quote_plus(loc)}/furniture?{urlencode(cat_params)}",
            "source": "facebook",
        }
    )
    return links


def craigslist_links(req: SearchLinkRequest) -> list[dict[str, str]]:
    """Craigslist furniture search — subdomain guessed from city name."""
    city = req.location.strip().lower().split(",")[0].strip()
    subdomain = city.replace(" ", "").replace(".", "")
    max_price = 0 if req.free_only else int(req.max_price)
    links: list[dict[str, str]] = []

    searches = [
        ("sofa | couch | sectional", "Sofas & sectionals"),
        ("free couch | free sofa | free sectional", "Free wording"),
    ]
    for query, label in searches:
        params = {
            "query": query,
            "hasPic": "1",
            "search_distance": str(req.radius_miles),
        }
        if req.free_only:
            # Craigslist free section
            url = f"https://{subdomain}.craigslist.org/search/zip?{urlencode({'query': 'couch | sofa | sectional', 'hasPic': '1'})}"
            links.append({"label": "Craigslist free (zip) — couches", "url": url, "source": "craigslist"})
            break
        params["max_price"] = str(max_price)
        url = f"https://{subdomain}.craigslist.org/search/fua?{urlencode(params)}"
        links.append({"label": f"Craigslist — {label}", "url": url, "source": "craigslist"})

    if not req.free_only:
        # Also free section
        url = f"https://{subdomain}.craigslist.org/search/zip?{urlencode({'query': 'couch | sofa | sectional', 'hasPic': '1'})}"
        links.append({"label": "Craigslist free section", "url": url, "source": "craigslist"})

    return links


def build_search_links(req: SearchLinkRequest) -> SearchLinks:
    tips = [
        "Facebook does not offer a public Marketplace API — open these searches in your browser (logged in).",
        "Sort by newest and turn on notifications for 'couch', 'sofa', 'sectional', and 'free furniture'.",
        "Message fast on freebies; ask for dimensions (L×D×H), smoke/pets, and whether sectional pieces separate.",
        f"Set Marketplace radius near {req.radius_miles} mi to match your trailer run economics.",
        "Skip anything with bedbugs, heavy mold, or frames that won't clear a ~72×72 in rear door.",
        "Batch pickups on one trailer run when scores are B+ and fit is confirmed.",
    ]
    return SearchLinks(
        facebook=facebook_links(req),
        craigslist=craigslist_links(req),
        tips=tips,
    )
