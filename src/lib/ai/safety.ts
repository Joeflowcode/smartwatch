/**
 * Shared AI safety rules for research assistant responses.
 * Keep language educational — never encourage impulsive wagering.
 */

export const AI_REFUSAL_PATTERNS: RegExp[] = [
  /match.?fix/i,
  /fix(ed)?\s+(the\s+)?(game|match|fight)/i,
  /insider(\s+info|\s+information)?/i,
  /guaranteed?\s+(win|profit|money|lock)/i,
  /\block(s|ed)?\b/i,
  /can'?t\s+lose/i,
  /sure\s+thing/i,
  /underage/i,
  /i\s+am\s+\d{1,2}\s*(years?\s*old)?/i,
  /bypass.*(geo|age|restriction|vpn)/i,
  /place.*(bet|wager).*for\s+me/i,
  /automate.*(bet|wager)/i,
  /steal.*(account|login)/i,
  /evade.*(gambling|betting)\s+(law|ban|restriction)/i,
];

export const RISKY_BEHAVIOR_PATTERNS: RegExp[] = [
  /chasing\s+(losses|my\s+loss)/i,
  /all\s+in/i,
  /bet\s+(my\s+)?(rent|paycheck|savings)/i,
  /can'?t\s+stop\s+betting/i,
  /tilting/i,
  /revenge\s+bet/i,
];

export function detectRefusal(input: string): boolean {
  return AI_REFUSAL_PATTERNS.some((p) => p.test(input));
}

export function detectRiskyBehavior(input: string): boolean {
  return RISKY_BEHAVIOR_PATTERNS.some((p) => p.test(input));
}

export const REFUSAL_MESSAGE =
  "I can't help with requests involving match fixing, insider information, guaranteed outcomes, underage gambling, placing bets, or evading restrictions. EdgePilot AI is a research and education tool only — not a sportsbook. If you're feeling pressure to wager, set a cool-off limit and visit /responsible-use for help resources.";

export const RISK_NUDGE =
  "\n\n---\n**Responsible-use check:** It sounds like this may involve chasing losses or oversized risk. Consider pausing, reviewing your bankroll limits in the app, and only staking money you can afford to lose. Resources: /responsible-use";

export const SUGGESTED_PROMPTS = [
  "Summarize tonight’s NBA slate and flag anything with stale odds.",
  "Explain the difference between market probability and model probability.",
  "Which lines moved the most in the mock sample today?",
  "How would a conservative quarter-Kelly stake look on a 55% estimate at -110?",
  "What injuries could affect the Celtics vs Knicks matchup (from available data)?",
  "Why might an apparent EV edge be misleading?",
] as const;
