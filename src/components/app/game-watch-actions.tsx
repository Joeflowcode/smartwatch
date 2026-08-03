"use client";

import { WatchlistButton } from "@/components/app/watchlist";

export function GameWatchActions({
  eventId,
  label,
}: {
  eventId: string;
  label: string;
}) {
  return <WatchlistButton entityType="game" entityId={eventId} label={label} />;
}
