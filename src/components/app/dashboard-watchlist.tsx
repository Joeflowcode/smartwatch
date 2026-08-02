"use client";

import Link from "next/link";
import { WatchlistPanel } from "@/components/app/watchlist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardWatchlistCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
        <CardDescription>
          Saved on this device.{" "}
          <Link href="/app/settings" className="underline">
            Manage
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WatchlistPanel />
      </CardContent>
    </Card>
  );
}
