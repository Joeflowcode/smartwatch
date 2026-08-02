"use client";

import { useSyncExternalStore } from "react";
import { SUPPORTED_SPORTS } from "@/config/site";
import { DEFAULT_PREFS, readUserPrefs } from "@/lib/prefs";

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("ep-prefs-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ep-prefs-changed", handler);
  };
}

function getFavorites() {
  return readUserPrefs().favoriteSports;
}

function getServerFavorites() {
  return DEFAULT_PREFS.favoriteSports;
}

/** Soft hint when the current sport filter is outside favorite sports. */
export function FavoriteSportsHint({ sport }: { sport?: string }) {
  const favorites = useSyncExternalStore(subscribe, getFavorites, getServerFavorites);
  if (!sport) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">
        Favorites: {favorites.join(", ") || "none"} · edit in Settings
      </p>
    );
  }
  const upper = sport.toUpperCase();
  if (
    favorites.includes(upper) ||
    !SUPPORTED_SPORTS.includes(upper as (typeof SUPPORTED_SPORTS)[number])
  ) {
    return null;
  }
  return (
    <p className="text-xs text-amber-700 dark:text-amber-300">
      {upper} is outside your favorite sports ({favorites.join(", ")}). You can change favorites in
      Settings.
    </p>
  );
}
