import { americanToDecimal, impliedProbability } from "@/lib/betting/odds";

/**
 * Closing Line Value (probability): closing implied − bet implied.
 * Positive means you got a better price than the close.
 */
export function closingLineValueProbability(
  betDecimalOdds: number,
  closingDecimalOdds: number,
): number {
  if (betDecimalOdds <= 1 || closingDecimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  return impliedProbability(closingDecimalOdds) - impliedProbability(betDecimalOdds);
}

/** Raw American-odds point difference (bet − close). */
export function closingLineValueAmericanPoints(
  betAmerican: number,
  closingAmerican: number,
): number {
  return betAmerican - closingAmerican;
}

export interface CsvBetRow {
  sport: string;
  event: string;
  market: string;
  selection: string;
  sportsbook: string;
  americanOdds: number;
  stake: number;
  status: string;
  notes?: string;
  closingLineAmerican?: number | null;
}

export function betsToCsv(rows: CsvBetRow[]): string {
  const header = [
    "sport",
    "event",
    "market",
    "selection",
    "sportsbook",
    "american_odds",
    "stake",
    "status",
    "notes",
    "closing_line_american",
    "clv_prob",
  ];

  const lines = rows.map((row) => {
    let clv = "";
    if (row.closingLineAmerican != null && row.closingLineAmerican !== 0) {
      clv = closingLineValueProbability(
        americanToDecimal(row.americanOdds),
        americanToDecimal(row.closingLineAmerican),
      ).toFixed(4);
    }
    return [
      row.sport,
      row.event,
      row.market,
      row.selection,
      row.sportsbook,
      String(row.americanOdds),
      String(row.stake),
      row.status,
      row.notes ?? "",
      row.closingLineAmerican == null ? "" : String(row.closingLineAmerican),
      clv,
    ]
      .map(csvEscape)
      .join(",");
  });

  return [header.join(","), ...lines].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadTextFile(filename: string, contents: string, mime = "text/csv") {
  if (typeof document === "undefined") return;
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
