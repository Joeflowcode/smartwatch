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
- [ ] Live The Odds API HTTP implementation with retry/timeout
- [ ] OpenAI tool-calling assistant wired to providers
- [ ] Admin live MRR queries
- [ ] Alerts / watchlists + Resend emails
- [ ] Affiliate click UI with disclosure
- [ ] Feedback widget + screenshot upload
- [ ] Playwright e2e for core flows
- [ ] Feature-flagged arbitrage UI

See [YOUR_NEXT_STEPS.md](./YOUR_NEXT_STEPS.md) for the human dashboard checklist.
