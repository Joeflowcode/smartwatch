import { detectArbitrage, decimalToAmerican } from "@/lib/betting/odds";
import { mockEvents, mockOdds } from "@/lib/providers/mock-odds";

export interface DemoArbCard {
  eventId: string;
  eventLabel: string;
  market: string;
  isArbitrage: boolean;
  margin: number;
  totalImplied: number;
  legs: Array<{
    outcome: string;
    sportsbook: string;
    americanOdds: number;
    decimalOdds: number;
    stakePercent: number;
  }>;
  warnings: string[];
  updatedAt: string;
}

/** Build illustrative arb candidates from best moneyline prices per event. */
export function findDemoArbitrage(): DemoArbCard[] {
  const cards: DemoArbCard[] = [];

  for (const event of mockEvents) {
    const ml = mockOdds.filter((o) => o.eventId === event.id && o.market === "moneyline");
    const bySelection = new Map<string, (typeof ml)[number]>();
    for (const quote of ml) {
      const existing = bySelection.get(quote.selection);
      if (!existing || quote.decimalOdds > existing.decimalOdds) {
        bySelection.set(quote.selection, quote);
      }
    }
    const best = [...bySelection.values()];
    if (best.length < 2) continue;

    // Slightly improve one price for demo so an arb can appear when books diverge.
    const legs = best.map((q, idx) => ({
      outcome: q.selection,
      sportsbook: q.sportsbook,
      decimalOdds: idx === 0 ? Number((q.decimalOdds * 1.03).toFixed(4)) : q.decimalOdds,
    }));

    const result = detectArbitrage(legs);

    cards.push({
      eventId: event.id,
      eventLabel: `${event.awayTeamName} @ ${event.homeTeamName}`,
      market: "moneyline",
      isArbitrage: result.isArbitrage,
      margin: result.margin,
      totalImplied: result.totalImplied,
      legs: result.allocations.map((a) => ({
        outcome: a.outcome,
        sportsbook: a.sportsbook,
        americanOdds: decimalToAmerican(a.decimalOdds),
        decimalOdds: a.decimalOdds,
        stakePercent: a.stakePercent,
      })),
      warnings: [
        "Not guaranteed profit — odds can change before both sides are filled.",
        "Accounts may be limited, delayed, or voided.",
        "Transaction costs and different juice rules reduce theoretical margin.",
        "Demo data may be synthetic for illustration.",
      ],
      updatedAt: best[0]?.updatedAt ?? new Date().toISOString(),
    });
  }

  return cards.filter((c) => c.isArbitrage);
}
