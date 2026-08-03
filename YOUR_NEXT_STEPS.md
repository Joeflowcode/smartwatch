# What you need to do next

I finished the code for **persisting onboarding / bets / bankroll**, **AI daily quota checks**, **EV scanner plan gating**, and **admin route protection**.  
You still need to connect the external services — only you can do these dashboard steps.

## 1) Create a Supabase project (required for real accounts)

1. Go to [https://supabase.com](https://supabase.com) → New project  
2. Project Settings → API → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only, never commit**)
3. SQL Editor → paste and run, in order:
   - [`supabase/migrations/20260331210000_init.sql`](supabase/migrations/20260331210000_init.sql)
   - [`supabase/migrations/20260331210100_seed.sql`](supabase/migrations/20260331210100_seed.sql)
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (later your Vercel domain)
   - Redirect URLs: `http://localhost:3000/api/auth/callback` (+ production callback)
5. Authentication → Providers → Email: enabled  
   - For local speed you can disable “Confirm email”; keep it on for production

### Make yourself admin

Authentication → Users → your user → **App Metadata** (not User Metadata):

```json
{ "role": "admin" }
```

Also set in `.env.local`:

```bash
ADMIN_EMAILS=you@example.com
```

## 2) Create Stripe products (required for paid trials)

1. [Stripe Dashboard](https://dashboard.stripe.com) → Products  
2. Create **Pro** ($24.99/mo + annual $249.90) and **Elite** ($79.99/mo + annual $799.90)  
3. Copy each Price ID into:
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_PRO_ANNUAL`
   - `STRIPE_PRICE_ELITE_MONTHLY`
   - `STRIPE_PRICE_ELITE_ANNUAL`
4. Developers → API keys → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY`
5. Webhooks → Add endpoint:
   - Local: run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Prod: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Copy signing secret → `STRIPE_WEBHOOK_SECRET`
7. Settings → Billing → Customer portal: enable cancel / update payment method

## 3) Local env file

```bash
cp .env.example .env.local
# fill Supabase + Stripe values from steps 1–2
npm run dev
```

Also set:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4) Smoke-test checklist (after keys are in)

- [ ] `/signup` with a real email → verify if required → `/app/onboarding` saves profile  
- [ ] Log a bet on `/app/bets` → refresh → bet still there  
- [ ] Save bankroll limits → refresh → values persist  
- [ ] `/app/ai` respects free daily limit after enough questions  
- [ ] Stripe test checkout from `/pricing` → subscription row updates  
- [ ] `/admin` works for your admin user; other users redirect to `/app`

## 5) Deploy to Vercel (when local works)

1. Import this GitHub repo in Vercel  
2. Paste the same env vars (production values)  
3. Set `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`  
4. Update Supabase Auth Site URL + redirect URLs to the production domain  
5. Point Stripe webhook to production `/api/stripe/webhook`

## Optional later (not blocking beta invites)

- The Odds API: `ODDS_API_KEY` + `ODDS_PROVIDER=the-odds-api` (+ optional `ODDS_API_REGIONS=us`)
- OpenAI: `OPENAI_API_KEY` + `AI_PROVIDER=openai` (+ optional `OPENAI_MODEL=gpt-4o-mini`)
- Resend: `RESEND_API_KEY` (+ `EMAIL_FROM`)
- PostHog / Sentry

## 6) Ship iOS + Android (native Expo app in `mobile/`)

The store apps are scaffolded as a real Expo native UI (not a WebView of the site).

1. Install Xcode / Android Studio (or use EAS cloud builds only)
2. `cd mobile && npm install && npx expo start` → try **Continue with demo**
3. Create Expo account → `npm i -g eas-cli && eas login && eas init`
4. Replace `extra.eas.projectId` in `mobile/app.json`
5. Apple Developer + App Store Connect app id `ai.edgepilot.app`
6. Google Play Console app id `ai.edgepilot.app`
7. `eas build --platform all --profile production`
8. Follow [mobile/STORE_SUBMISSION.md](./mobile/STORE_SUBMISSION.md) for listing copy, age ratings, gambling disclosures
9. After web API is live: set EAS secrets `EXPO_PUBLIC_API_URL`, Supabase keys, then rebuild

---

**When you’re done with steps 1–3**, reply with “Supabase + Stripe connected” (or paste any error) and I’ll help verify webhooks / fix whatever fails.  
**For stores**, reply with “EAS ready” after `eas init` and I’ll help with the first TestFlight / Play internal upload.
