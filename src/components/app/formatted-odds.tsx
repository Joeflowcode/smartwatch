"use client";

import { useSyncExternalStore } from "react";
import {
  decimalToAmerican,
  decimalToFractional,
  formatAmerican,
} from "@/lib/betting/odds";
import { DEFAULT_PREFS, PREFS_KEY, readUserPrefs, type OddsFormatPref } from "@/lib/prefs";

function subscribe(onStoreChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === PREFS_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("ep-prefs-changed", onStoreChange as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("ep-prefs-changed", onStoreChange as EventListener);
  };
}

function getFormat(): OddsFormatPref {
  return readUserPrefs().oddsFormat;
}

function getServerFormat(): OddsFormatPref {
  return DEFAULT_PREFS.oddsFormat;
}

export function FormattedOdds({
  american,
  decimal,
}: {
  american: number;
  decimal?: number;
}) {
  const format = useSyncExternalStore(subscribe, getFormat, getServerFormat);
  const dec = decimal ?? (american > 0 ? american / 100 + 1 : 100 / Math.abs(american) + 1);

  if (format === "decimal") {
    return <span className="font-mono">{dec.toFixed(2)}</span>;
  }
  if (format === "fractional") {
    const { numerator, denominator } = decimalToFractional(dec);
    return (
      <span className="font-mono">
        {numerator}/{denominator}
      </span>
    );
  }
  const am = american || decimalToAmerican(dec);
  return <span className="font-mono">{formatAmerican(am)}</span>;
}
