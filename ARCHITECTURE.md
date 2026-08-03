# Architecture

## Overview

EdgePilot AI is a Next.js App Router SaaS:

- **Marketing** routes under `src/app/(marketing)`
- **Auth** under `src/app/(auth)`
- **Product** under `src/app/(app)/app/*`
- **Admin** under `src/app/admin`
- **APIs** under `src/app/api/*`

## Data flow

```
Browser → Middleware (session / demo cookie)
       → Server Components / Server Actions / Route Handlers
       → Provider factories (mock | live)
       → Supabase (RLS) / Stripe / OpenAI / Odds API
```

## Provider pattern

Interfaces in `src/lib/providers/*`:

- `OddsProvider`
- `SportsDataProvider` / `InjuryProvider` / `StatsProvider` / `WeatherProvider`
- `AIProvider`
- `EmailProvider`

Factories in `src/lib/providers/index.ts` select implementations from env. All responses include `fetchedAt`, `isStale`, `isMock`.

## Entitlements

Plan limits live in `src/config/pricing.ts`. Server-side checks use `src/lib/stripe/entitlements.ts`. Stripe webhooks update `subscriptions` via service role.

## Betting math

Pure functions in `src/lib/betting/odds.ts` (conversion, implied prob, no-vig, EV, Kelly, arbitrage) with Vitest coverage.

## Feature flags

Compile-time flags in `src/config/site.ts` and DB table `feature_flags` for runtime toggles.
