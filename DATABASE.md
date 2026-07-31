# Database

Migrations: `supabase/migrations/`

1. `20260331210000_init.sql` — schema, triggers, RLS
2. `20260331210100_seed.sql` — NBA/NFL/MLB/NHL reference + sample events + flags

## Core entities

Users → profiles / preferences / age_acknowledgments  
Sports hierarchy → sports → leagues → teams → players → events → markets → outcomes  
Odds → sportsbook_operators → odds_snapshots → line_movements  
Models → model_predictions → ev_opportunities → arbitrage_opportunities  
Billing → subscriptions → subscription_entitlements  
User tools → tracked_bets, bankroll_*, watchlists, alerts, ai_*, saved_analyses  
Growth → affiliate_*, support_requests, feature_flags, audit_logs

## RLS summary

| Area | Policy |
|------|--------|
| Profile / prefs / bets / bankroll / AI | Owner only |
| Reference sports/odds | Authenticated read |
| Admin tables | `is_admin()` from JWT `app_metadata.role` |
| Affiliate partners | Active rows readable; admin manage |

## Retention

Soft-delete columns on profiles, bets, AI conversations, saved analyses. Define retention jobs before GA (e.g. purge deleted rows after 30–90 days).
