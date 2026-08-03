# API integrations

## Odds

- Interface: `OddsProvider`
- Mock: `MockOddsProvider` (default)
- Live HTTP: `TheOddsApiProvider` when `ODDS_PROVIDER=the-odds-api` and `ODDS_API_KEY` set
  - Timeout + retry (`src/lib/http/fetch-retry.ts`)
  - Sports: NBA / NFL / MLB / NHL
  - Optional `ODDS_API_REGIONS` (default `us`)
  - EV scanner uses best moneyline vs no-vig consensus prior (not a proprietary model)

## Sports / injuries / stats / weather

Mock implementations in `src/lib/providers/mock-sports.ts`. Swap via factories when a vendor is selected (Sportradar, SportsDataIO, etc.).

## AI

- Interface: `AIProvider`
- Shared tools: `get_slate`, `explain_probabilities`, `size_stake` (`src/lib/ai/tools.ts`)
- Mock: `MockAIProvider` routes through the same tools + safety refusals
- Live: `OpenAIProvider` when `AI_PROVIDER=openai` and `OPENAI_API_KEY` set (optional `OPENAI_MODEL`)
- Route: `POST /api/ai/chat` with Zod body + consent-gated history persistence

## Email

- Mock: `MockEmailProvider` (console)
- Live: `ResendEmailProvider` when `RESEND_API_KEY` set (`EMAIL_FROM` optional)
- Research alert helper: `sendAlertEmail` + `sendTestAlertEmail` from `/app/alerts`

## Billing

- Stripe checkout / portal / webhook under `src/app/api/stripe/*`
- Entitlements: `src/lib/stripe/entitlements.ts` + `src/config/pricing.ts`
- Admin MRR helper: `getAdminMetrics()` (list-price estimate from `subscriptions`)

## Observability

- PostHog: optional client analytics (`track()` no-ops without key)
- Sentry: optional error monitoring

Never fabricate live odds/injuries in production. Label mock data clearly in development.
