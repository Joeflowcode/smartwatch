# EdgePilot AI

AI-powered sports betting **research** assistant. Compare odds, estimate expected value, track bets, and manage bankroll limits — with transparent AI explanations.

**Not a sportsbook.** We do not accept wagers, custody funds, or guarantee outcomes.

Tagline: *Research the edge. Control the risk.*

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- Stripe subscriptions
- Provider abstractions for odds, sports data, AI, and email
- Vitest + Playwright

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase keys, use **demo mode**: Sign up / Log in continues with a local cookie and mock sports data.

### Common commands

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # Vitest unit tests
npm run test:e2e     # Playwright (server must be running)
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [SETUP.md](./SETUP.md) | Local environment setup |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Supabase, Stripe, Vercel go-live |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design |
| [DATABASE.md](./DATABASE.md) | Schema & RLS |
| [SECURITY.md](./SECURITY.md) | Security baseline |
| [API_INTEGRATIONS.md](./API_INTEGRATIONS.md) | Provider adapters |
| [MONETIZATION.md](./MONETIZATION.md) | Plans & Stripe |
| [RESPONSIBLE_USE.md](./RESPONSIBLE_USE.md) | Responsible gambling |
| [BETA_LAUNCH.md](./BETA_LAUNCH.md) | Launch sequence |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guide |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Living checklist |

## License

Private / proprietary unless otherwise stated.
