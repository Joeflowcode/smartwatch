/**
 * Betting mathematics utilities.
 * Odds are normalized internally as decimal (European) odds.
 */

export type OddsFormat = "american" | "decimal" | "fractional";

export function americanToDecimal(american: number): number {
  if (american === 0) {
    throw new Error("American odds cannot be zero");
  }
  if (american > 0) {
    return american / 100 + 1;
  }
  return 100 / Math.abs(american) + 1;
}

export function decimalToAmerican(decimal: number): number {
  if (decimal <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }
  return Math.round(-100 / (decimal - 1));
}

export function fractionalToDecimal(numerator: number, denominator: number): number {
  if (denominator === 0) {
    throw new Error("Fractional odds denominator cannot be zero");
  }
  return numerator / denominator + 1;
}

export function decimalToFractional(decimal: number): { numerator: number; denominator: number } {
  if (decimal <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  const profit = decimal - 1;
  // Reduce to a simple fraction with denominator up to 100
  let bestNum = Math.round(profit * 100);
  let bestDen = 100;
  let bestErr = Math.abs(profit - bestNum / bestDen);
  for (let den = 1; den <= 100; den += 1) {
    const num = Math.round(profit * den);
    const err = Math.abs(profit - num / den);
    if (err < bestErr) {
      bestErr = err;
      bestNum = num;
      bestDen = den;
    }
  }
  const g = gcd(bestNum, bestDen);
  return { numerator: bestNum / g, denominator: bestDen / g };
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function toDecimal(odds: number, format: OddsFormat): number {
  switch (format) {
    case "american":
      return americanToDecimal(odds);
    case "decimal":
      if (odds <= 1) throw new Error("Decimal odds must be greater than 1");
      return odds;
    case "fractional":
      throw new Error("Use fractionalToDecimal for fractional odds");
    default:
      throw new Error(`Unsupported odds format: ${format satisfies never}`);
  }
}

/** Implied probability from decimal odds (includes vig). */
export function impliedProbability(decimalOdds: number): number {
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  return 1 / decimalOdds;
}

/**
 * Remove vig from a two-way (or multi-way) market using multiplicative method.
 * Returns fair probabilities that sum to 1.
 */
export function noVigProbabilities(decimalOdds: number[]): number[] {
  if (decimalOdds.length < 2) {
    throw new Error("At least two outcomes required");
  }
  const implied = decimalOdds.map(impliedProbability);
  const total = implied.reduce((sum, p) => sum + p, 0);
  if (total <= 0) {
    throw new Error("Invalid implied probabilities");
  }
  return implied.map((p) => p / total);
}

/** Expected value of a $1 stake given true probability and decimal odds. */
export function expectedValue(trueProbability: number, decimalOdds: number): number {
  if (trueProbability < 0 || trueProbability > 1) {
    throw new Error("Probability must be between 0 and 1");
  }
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  return trueProbability * (decimalOdds - 1) - (1 - trueProbability);
}

/** Edge = model probability − market implied probability. */
export function edge(modelProbability: number, marketImpliedProbability: number): number {
  return modelProbability - marketImpliedProbability;
}

/**
 * Full Kelly fraction for a binary bet.
 * Returns 0 when there is no positive edge.
 */
export function kellyFraction(trueProbability: number, decimalOdds: number): number {
  if (trueProbability <= 0 || trueProbability >= 1) {
    return 0;
  }
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const q = 1 - trueProbability;
  const f = (b * trueProbability - q) / b;
  return Math.max(0, f);
}

/** Fractional Kelly (default quarter Kelly for conservative bankroll). */
export function fractionalKelly(
  trueProbability: number,
  decimalOdds: number,
  fraction = 0.25,
): number {
  return kellyFraction(trueProbability, decimalOdds) * fraction;
}

export function recommendedStake(
  bankroll: number,
  trueProbability: number,
  decimalOdds: number,
  kellyMultiplier = 0.25,
  maxStakePercent = 0.02,
): number {
  if (bankroll <= 0) return 0;
  const kelly = fractionalKelly(trueProbability, decimalOdds, kellyMultiplier);
  const capped = Math.min(kelly, maxStakePercent);
  return Math.max(0, bankroll * capped);
}

export function payout(stake: number, decimalOdds: number): number {
  return stake * decimalOdds;
}

export function profit(stake: number, decimalOdds: number): number {
  return stake * (decimalOdds - 1);
}

export interface ArbitrageLeg {
  outcome: string;
  decimalOdds: number;
  sportsbook: string;
}

export interface ArbitrageOpportunity {
  isArbitrage: boolean;
  totalImplied: number;
  margin: number;
  allocations: Array<{
    outcome: string;
    sportsbook: string;
    decimalOdds: number;
    stakePercent: number;
  }>;
  theoreticalReturnPercent: number;
}

/**
 * Detect arbitrage across mutually exclusive outcomes using best odds per outcome.
 * Warning: theoretical only — lines move, bets can be rejected or limited.
 */
export function detectArbitrage(
  legs: ArbitrageLeg[],
  totalStake = 100,
): ArbitrageOpportunity {
  if (legs.length < 2) {
    throw new Error("At least two legs required");
  }
  const totalImplied = legs.reduce((sum, leg) => sum + impliedProbability(leg.decimalOdds), 0);
  const isArbitrage = totalImplied < 1;
  const margin = 1 - totalImplied;
  const allocations = legs.map((leg) => {
    const stakePercent = impliedProbability(leg.decimalOdds) / totalImplied;
    return {
      outcome: leg.outcome,
      sportsbook: leg.sportsbook,
      decimalOdds: leg.decimalOdds,
      stakePercent,
      stake: totalStake * stakePercent,
    };
  });

  return {
    isArbitrage,
    totalImplied,
    margin,
    allocations: allocations.map(({ outcome, sportsbook, decimalOdds, stakePercent }) => ({
      outcome,
      sportsbook,
      decimalOdds,
      stakePercent,
    })),
    theoreticalReturnPercent: isArbitrage ? margin : 0,
  };
}

export function formatAmerican(american: number): string {
  return american > 0 ? `+${american}` : `${american}`;
}

export function parseAmerican(input: string): number {
  const cleaned = input.trim().replace(/^\+/, "");
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value === 0) {
    throw new Error("Invalid American odds");
  }
  return value;
}
