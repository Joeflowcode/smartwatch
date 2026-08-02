"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "ep_watchlist";

export type WatchItem = {
  entityType: "game" | "team" | "player" | "market";
  entityId: string;
  label: string;
};

function load(): WatchItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as WatchItem[];
  } catch {
    return [];
  }
}

function save(items: WatchItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>(() =>
    typeof window === "undefined" ? [] : load(),
  );

  function toggle(item: WatchItem) {
    setItems((prev) => {
      const exists = prev.some(
        (p) => p.entityType === item.entityType && p.entityId === item.entityId,
      );
      const next = exists
        ? prev.filter(
            (p) => !(p.entityType === item.entityType && p.entityId === item.entityId),
          )
        : [...prev, item];
      save(next);
      return next;
    });
  }

  function has(entityType: WatchItem["entityType"], entityId: string) {
    return items.some((p) => p.entityType === entityType && p.entityId === entityId);
  }

  return { items, toggle, has };
}

export function WatchlistButton({
  entityType,
  entityId,
  label,
}: {
  entityType: WatchItem["entityType"];
  entityId: string;
  label: string;
}) {
  const { toggle, has } = useWatchlist();
  const active = has(entityType, entityId);

  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={() => toggle({ entityType, entityId, label })}
    >
      {active ? "Watching" : "Watch"}
    </Button>
  );
}

export function WatchlistPanel() {
  const { items, toggle } = useWatchlist();
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        No watchlist items yet. Use Watch on a game page.
      </p>
    );
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li
          key={`${item.entityType}:${item.entityId}`}
          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
        >
          <span>
            <span className="text-xs uppercase text-[var(--muted-foreground)]">
              {item.entityType}
            </span>{" "}
            {item.label}
          </span>
          <Button type="button" size="sm" variant="ghost" onClick={() => toggle(item)}>
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
