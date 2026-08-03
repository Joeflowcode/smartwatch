# Monetization

## Plans

Configured in `src/config/pricing.ts`:

| Plan | Monthly | Annual |
|------|---------|--------|
| Free | $0 | — |
| Pro | $24.99 | $249.90 (2 months free) |
| Elite | $79.99 | $799.90 |

Change prices in config + Stripe Dashboard without rewriting entitlement logic.

## Stripe flows

- Checkout: `POST /api/stripe/checkout`
- Portal: `POST /api/stripe/portal`
- Webhooks: `POST /api/stripe/webhook` (signature required)

Entitlements resolved server-side via `subscriptions` + plan limits.

## Affiliates

Optional. Schema supports partners, jurisdictions, disclosure, click tracking. Links must be labeled, age-gated, jurisdiction-aware. Product works without affiliates.

## Trials

Default `STRIPE_TRIAL_DAYS=7` on checkout subscription_data.
