# Project status — EdgePilot AI beta

## Milestone 1 (complete)

- [x] Next.js App Router + TypeScript + Tailwind scaffold
- [x] Design system (light/dark, typography, chrome)
- [x] Marketing: home, features, pricing, responsible use, methodology, FAQ, terms, privacy, affiliate disclosure, contact
- [x] Auth pages: signup, login, reset, verify + demo mode
- [x] Onboarding with age / responsible-use gate
- [x] Supabase migrations + RLS + seed
- [x] Mock odds / sports / AI / email providers
- [x] Dashboard, odds comparison, EV scanner, games, bets, bankroll, AI chat
- [x] Betting math utilities + Vitest
- [x] Stripe checkout / portal / webhook architecture + pricing config
- [x] Admin metrics shell
- [x] Docs + `.env.example`
- [x] Lint / typecheck / test / build green

## Milestone 2

- [x] Persist bets/bankroll/onboarding to Supabase (demo fallback retained)
- [x] Server-enforced plan gates on scanner/AI quotas
- [x] Admin role middleware (`app_metadata.role` + `ADMIN_EMAILS`)
- [x] Stronger AI chat UX + safety refusals + grounded mock tools
- [x] Bet tracker performance analytics (equity + breakdowns)
- [x] In-app feedback / bug-report widget
- [x] Mobile bottom nav + responsive marketing header
- [x] Landing conversion polish (“How the beta works”)
- [x] Playwright demo-flow specs + AI safety unit tests
- [x] Feature-flagged arbitrage UI (`NEXT_PUBLIC_FEATURE_arbitrageAlerts`)
- [x] Local watchlists + game Watch button
- [x] CLV math + CSV bet export
- [x] Odds mobile stacked quotes + empty states
- [x] Settings preferences + `/api/health`
- [x] Local alerts UI (thresholds; no spammy loss-chasing)
- [x] SEO: sitemap, robots, manifest, Open Graph metadata
- [x] Affiliate disclosure labels near odds/game pages
- [x] AI route rate limiting + richer mock slate fixtures
- [x] Game notes (local) + focus-visible a11y polish
- [x] Route loading / error / 404 + global-error boundaries
- [x] Skip-to-content + active nav `aria-current` (app + marketing)
- [x] Odds format preference wired into Odds / Scanner / Games / Dashboard
- [x] Scanner / bets / alerts empty states + FAQ accordion + features CTAs
- [x] Shared contact Zod schema + expanded unit tests (providers, entitlements, odds, AI)
- [x] Live The Odds API HTTP implementation with retry/timeout
- [x] OpenAI chat provider with safety pre-checks + tool-calling (slate / probs / Kelly)
- [ ] Admin live MRR queries (offline shell clarifies demo vs connected)
- [x] Resend email provider adapter + test alert email action
- [ ] Scheduled alert fan-out cron / job queue
- [x] Affiliate click tracking hooks + feature-flagged book labels
- [x] Feedback screenshot metadata attachment (Storage upload later)

See [YOUR_NEXT_STEPS.md](./YOUR_NEXT_STEPS.md) for the human dashboard checklist.
