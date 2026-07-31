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

## Milestone 2 (next)

- [ ] Live The Odds API HTTP implementation with retry/timeout
- [ ] OpenAI tool-calling assistant wired to providers
- [ ] Persist bets/bankroll/onboarding to Supabase
- [ ] Server-enforced plan gates on scanner/AI quotas
- [ ] Admin role middleware + live MRR queries
- [ ] Alerts / watchlists + Resend emails
- [ ] Affiliate click UI with disclosure
- [ ] Feedback widget + screenshot upload
- [ ] Playwright e2e for core flows
- [ ] Feature-flagged arbitrage UI
