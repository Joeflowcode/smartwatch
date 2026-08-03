# Setup

## Prerequisites

- Node.js 20+
- npm 10+
- Optional: Supabase project, Stripe account, Odds API key, OpenAI key, Resend, PostHog, Sentry

## Install

```bash
cp .env.example .env.local
npm install
```

Fill `.env.local` as keys become available. The app runs with **mock providers** when sports/AI keys are absent.

## Supabase (optional for demo UI)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy service role key into `SUPABASE_SERVICE_ROLE_KEY` (server only).
4. Run SQL in `supabase/migrations/` via SQL editor or Supabase CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

5. Auth → URL configuration: add `http://localhost:3000/api/auth/callback`.
6. Enable Email provider; turn on confirmations for production.

## Stripe (optional)

1. Create Products/Prices matching Free/Pro/Elite (Pro $24.99, Elite $79.99; annual = 10× monthly).
2. Set `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_ANNUAL`.
3. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Run

```bash
npm run dev
```

Visit `/` for marketing, `/signup` for demo auth, `/app` for dashboard.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
