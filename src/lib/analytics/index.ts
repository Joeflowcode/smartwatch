/** Privacy-conscious product analytics stub. No-ops without PostHog key. */

export type AnalyticsEvent =
  | "signup_started"
  | "signup_completed"
  | "onboarding_completed"
  | "pricing_viewed"
  | "trial_started"
  | "subscription_started"
  | "subscription_upgraded"
  | "subscription_canceled"
  | "ai_question_submitted"
  | "ev_scanner_viewed"
  | "opportunity_saved"
  | "alert_created"
  | "bet_logged"
  | "affiliate_disclosure_viewed"
  | "affiliate_link_clicked";

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, properties ?? {});
    }
    return;
  }
  // PostHog client wiring activates when key is present in the browser entry.
  console.debug("[analytics:queued]", event, properties ?? {});
}
