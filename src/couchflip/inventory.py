"""JSON-file inventory store for flip pipeline."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .models import InventoryCreate, InventoryItem, InventoryStatus, InventoryUpdate

DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "inventory.json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class InventoryStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or DEFAULT_PATH
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write([])

    def _read(self) -> list[dict]:
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _write(self, rows: list[dict]) -> None:
        self.path.write_text(json.dumps(rows, indent=2), encoding="utf-8")

    def list_items(self, status: InventoryStatus | None = None) -> list[InventoryItem]:
        rows = self._read()
        items = [InventoryItem.model_validate(r) for r in rows]
        if status:
            items = [i for i in items if i.status == status]
        return sorted(items, key=lambda i: i.updated_at, reverse=True)

    def get(self, item_id: str) -> InventoryItem | None:
        for item in self.list_items():
            if item.id == item_id:
                return item
        return None

    def create(self, payload: InventoryCreate) -> InventoryItem:
        now = _now()
        item = InventoryItem(
            id=str(uuid.uuid4())[:8],
            created_at=now,
            updated_at=now,
            status=payload.status,
            listing=payload.listing,
            buy_price=payload.buy_price,
            all_in_cost=payload.all_in_cost,
            list_price=payload.list_price,
            score=payload.score,
            grade=payload.grade,
            estimated_profit=payload.estimated_profit,
            marketplace_url=payload.marketplace_url,
            notes=payload.notes,
        )
        rows = self._read()
        rows.append(item.model_dump(mode="json"))
        self._write(rows)
        return item

    def update(self, item_id: str, payload: InventoryUpdate) -> InventoryItem | None:
        rows = self._read()
        for idx, row in enumerate(rows):
            if row.get("id") != item_id:
                continue
            item = InventoryItem.model_validate(row)
            data = payload.model_dump(exclude_unset=True)
            if "listing" in data and data["listing"] is not None:
                item.listing = payload.listing  # type: ignore[assignment]
                del data["listing"]
            for key, value in data.items():
                setattr(item, key, value)
            if item.sold_price is not None and item.status == InventoryStatus.SOLD:
                cost = item.all_in_cost if item.all_in_cost else item.buy_price
                item.actual_profit = round(item.sold_price - cost, 2)
            item.updated_at = _now()
            rows[idx] = item.model_dump(mode="json")
            self._write(rows)
            return item
        return None

    def delete(self, item_id: str) -> bool:
        rows = self._read()
        new_rows = [r for r in rows if r.get("id") != item_id]
        if len(new_rows) == len(rows):
            return False
        self._write(new_rows)
        return True

    def summary(self) -> dict:
        items = self.list_items()
        by_status: dict[str, int] = {}
        for i in items:
            by_status[i.status.value] = by_status.get(i.status.value, 0) + 1
        sold = [i for i in items if i.status == InventoryStatus.SOLD and i.actual_profit is not None]
        active_cost = sum(
            i.all_in_cost or i.buy_price
            for i in items
            if i.status
            in {
                InventoryStatus.PICKED_UP,
                InventoryStatus.CLEANING,
                InventoryStatus.LISTED,
            }
        )
        return {
            "count": len(items),
            "by_status": by_status,
            "realized_profit": round(sum(i.actual_profit or 0 for i in sold), 2),
            "sold_count": len(sold),
            "capital_in_active_inventory": round(active_cost, 2),
        }
