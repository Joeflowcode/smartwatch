# API integrations

## Odds

- Interface: `OddsProvider`
- Mock: `MockOddsProvider` (default)
- Live HTTP: `TheOddsApiProvider` when `ODDS_PROVIDER=the-odds-api` and `ODDS_API_KEY` set (retry/timeout; NBA/NFL/MLB/NHL; EV from no-vig consensus prior)
- OpenAI: `OpenAIProvider` when `AI_PROVIDER=openai` and `OPENAI_API_KEY` set (safety refusals + grounded slate context)
- Resend: `ResendEmailProvider` when `RESEND_API_KEY` set
- Extend `getEvents` / `getOdds` with HTTP + retry/timeout before enabling in production

## Sports / injuries / stats / weather

Mock implementations in `src/lib/providers/mock-sports.ts`. Swap via factories when a vendor is selected (Sportradar, SportsDataIO, etc.).

## AI

- Interface: `AIProvider`
- Mock grounded responses + refusal patterns
- Route: `POST /api/ai/chat` with Zod validation
- Wire OpenAI tool calling against provider methods for production

## Email

- `EmailProvider` with console mock
- Resend when `RESEND_API_KEY` + `EMAIL_FROM` configured

## Observability

- PostHog: optional client analytics
- Sentry: optional error monitoring

Never fabricate live odds/injuries in production. Label mock data clearly in development.
