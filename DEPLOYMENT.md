# Deployment

## 1. Supabase

1. Create production project.
2. Apply migrations in `supabase/migrations/` (`db push` or SQL editor).
3. Configure Auth email templates and site URL (`https://your-domain`).
4. Add redirect URLs: `https://your-domain/api/auth/callback`.
5. Promote first admin: set `app_metadata.role = "admin"` on the user (Dashboard → Users → raw app meta). **Never** use `user_metadata` for authorization.

## 2. Stripe

1. Create Pro and Elite products with monthly + annual prices.
2. Configure Customer Portal (cancel, update payment method).
3. Webhook endpoint: `https://your-domain/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`.
5. Set trial days via `STRIPE_TRIAL_DAYS` (default 7).

## 3. Providers

| Variable | Purpose |
|----------|---------|
| `ODDS_API_KEY` + `ODDS_PROVIDER=the-odds-api` | Live odds (adapter placeholder; mock default) |
| `OPENAI_API_KEY` + `AI_PROVIDER=openai` | Live AI (mock until fully wired) |
| `RESEND_API_KEY` + `EMAIL_FROM` | Transactional email |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |
| `SENTRY_DSN` | Error monitoring |

## 4. Vercel

1. Import the GitHub repo.
2. Set all env vars from `.env.example` (production values).
3. `NEXT_PUBLIC_APP_URL=https://your-domain`
4. Deploy. Framework preset: Next.js.

## 5. Domain & monitoring

1. Attach custom domain in Vercel + Supabase Auth allow-list.
2. Confirm Sentry project receiving events.
3. Confirm PostHog receiving `signup_*` events when wired.

## 6. Post-deploy smoke test

- [ ] Homepage loads; legal disclaimer visible
- [ ] Signup + email verification (or demo path)
- [ ] Onboarding age gate blocks underage path
- [ ] Dashboard shows games (mock or live)
- [ ] Odds + EV scanner pages render
- [ ] Log a bet; bankroll limit warning works
- [ ] Stripe checkout test mode + portal
- [ ] Webhook updates subscription row
- [ ] `/admin` reachable only for admins (enforce RLS + middleware role check before public launch)
- [ ] No service role key in client bundle

## Rollback

Redeploy previous Vercel deployment; keep DB migrations forward-only with compensating migrations if needed.
