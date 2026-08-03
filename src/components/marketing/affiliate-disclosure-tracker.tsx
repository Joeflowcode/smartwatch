"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function AffiliateDisclosureTracker() {
  useEffect(() => {
    track("affiliate_disclosure_viewed");
  }, []);
  return null;
}
