-- EdgePilot AI initial schema
-- Apply with: supabase db push  OR  psql / SQL editor

create extension if not exists "pgcrypto";

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  country text,
  region text,
  timezone text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  starting_bankroll numeric(12,2),
  monthly_budget numeric(12,2),
  onboarding_completed_at timestamptz,
  is_suspended boolean not null default false,
  is_beta_user boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  favorite_sports text[] not null default '{}',
  preferred_sportsbooks text[] not null default '{}',
  odds_format text not null default 'american' check (odds_format in ('american', 'decimal', 'fractional')),
  ai_history_enabled boolean not null default true,
  email_alerts_enabled boolean not null default true,
  alert_frequency text not null default 'normal' check (alert_frequency in ('low', 'normal', 'high')),
  theme text default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.age_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  is_legal_age boolean not null,
  responsible_use_accepted boolean not null,
  jurisdiction_note text,
  acknowledged_at timestamptz not null default now(),
  unique (user_id)
);

create table public.sports (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leagues (
  id text primary key,
  sport_id text not null references public.sports (id),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id text primary key,
  league_id text not null references public.leagues (id),
  name text not null,
  abbreviation text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id text references public.teams (id),
  full_name text not null,
  position text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.events (
  id text primary key,
  sport_id text not null references public.sports (id),
  league_id text not null references public.leagues (id),
  home_team_id text not null references public.teams (id),
  away_team_id text not null references public.teams (id),
  starts_at timestamptz not null,
  venue text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'final', 'postponed', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (starts_at);
create index events_sport_id_idx on public.events (sport_id);

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null check (market_type in ('moneyline', 'spread', 'total', 'player_prop')),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id) on delete cascade,
  name text not null,
  line numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sportsbook_operators (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.odds_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null,
  selection text not null,
  sportsbook_id text not null references public.sportsbook_operators (id),
  american_odds integer not null,
  decimal_odds numeric(12,6) not null,
  line numeric(10,2),
  implied_probability numeric(10,6) not null,
  captured_at timestamptz not null default now(),
  provider text not null default 'mock',
  created_at timestamptz not null default now()
);

create index odds_snapshots_event_idx on public.odds_snapshots (event_id, captured_at desc);

create table public.line_movements (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null,
  selection text not null,
  sportsbook_id text not null references public.sportsbook_operators (id),
  from_american integer,
  to_american integer,
  from_line numeric(10,2),
  to_line numeric(10,2),
  moved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.injuries (
  id uuid primary key default gen_random_uuid(),
  team_id text references public.teams (id),
  player_name text not null,
  status text not null,
  description text,
  reported_at timestamptz not null default now(),
  provider text not null default 'mock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.statistics (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('team', 'player')),
  entity_id text not null,
  season text,
  stat_key text not null,
  stat_value numeric,
  meta jsonb not null default '{}',
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.model_predictions (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null,
  selection text not null,
  model_probability numeric(10,6) not null,
  model_version text not null default 'v0-mock',
  data_quality text not null default 'medium' check (data_quality in ('low', 'medium', 'high')),
  factors jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ev_opportunities (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null,
  selection text not null,
  sportsbook_id text not null references public.sportsbook_operators (id),
  american_odds integer not null,
  decimal_odds numeric(12,6) not null,
  model_probability numeric(10,6) not null,
  market_probability numeric(10,6) not null,
  no_vig_probability numeric(10,6) not null,
  edge numeric(10,6) not null,
  expected_value numeric(10,6) not null,
  data_quality text not null default 'medium',
  sample_size integer,
  key_factors jsonb not null default '[]',
  risk_warnings jsonb not null default '[]',
  why_may_be_wrong jsonb not null default '[]',
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.arbitrage_opportunities (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  market_type text not null,
  legs jsonb not null,
  total_implied numeric(10,6) not null,
  margin numeric(10,6) not null,
  warnings jsonb not null default '[]',
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'elite')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'none')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.subscription_entitlements (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  entitlement_key text not null,
  entitlement_value text not null,
  created_at timestamptz not null default now(),
  unique (subscription_id, entitlement_key)
);

create table public.tracked_bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sport text not null,
  league text,
  event_label text not null,
  market text not null,
  selection text not null,
  sportsbook text not null,
  american_odds integer not null,
  stake numeric(12,2) not null,
  bet_date date not null default current_date,
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'push', 'void')),
  result text,
  profit_loss numeric(12,2),
  closing_line_american integer,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index tracked_bets_user_idx on public.tracked_bets (user_id, bet_date desc);

create table public.bankroll_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  starting_bankroll numeric(12,2) not null default 0,
  current_bankroll numeric(12,2) not null default 0,
  monthly_budget numeric(12,2),
  max_stake_percent numeric(6,4) not null default 0.02,
  daily_loss_limit numeric(12,2),
  weekly_loss_limit numeric(12,2),
  kelly_fraction numeric(6,4) not null default 0.25,
  cool_off_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bankroll_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_type text not null check (entry_type in ('deposit', 'withdrawal', 'adjustment', 'bet_settlement')),
  amount numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null check (entity_type in ('game', 'team', 'player', 'market')),
  entity_id text not null,
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  alert_type text not null check (alert_type in ('target_odds', 'line_move', 'ev_threshold')),
  config jsonb not null default '{}',
  channel text not null default 'in_app' check (channel in ('in_app', 'email')),
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.saved_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id text references public.events (id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  base_url text not null,
  jurisdictions text[] not null default '{}',
  disclosure_text text not null,
  is_active boolean not null default false,
  placement text not null default 'odds_row',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners (id),
  user_id uuid references public.profiles (id),
  campaign text,
  path text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  description text,
  enabled boolean not null default false,
  meta jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  email text,
  category text not null default 'general'
    check (category in ('general', 'bug', 'feature', 'billing')),
  message text not null,
  page_path text,
  browser_meta jsonb not null default '{}',
  satisfaction_score integer check (satisfaction_score between 1 and 5),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers (selected tables)
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger tracked_bets_updated_at before update on public.tracked_bets
  for each row execute function public.set_updated_at();
create trigger bankroll_settings_updated_at before update on public.bankroll_settings
  for each row execute function public.set_updated_at();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'active');
  insert into public.bankroll_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.age_acknowledgments enable row level security;
alter table public.sports enable row level security;
alter table public.leagues enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.events enable row level security;
alter table public.markets enable row level security;
alter table public.outcomes enable row level security;
alter table public.sportsbook_operators enable row level security;
alter table public.odds_snapshots enable row level security;
alter table public.line_movements enable row level security;
alter table public.injuries enable row level security;
alter table public.statistics enable row level security;
alter table public.model_predictions enable row level security;
alter table public.ev_opportunities enable row level security;
alter table public.arbitrage_opportunities enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.tracked_bets enable row level security;
alter table public.bankroll_settings enable row level security;
alter table public.bankroll_entries enable row level security;
alter table public.watchlists enable row level security;
alter table public.alerts enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.saved_analyses enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.audit_logs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.support_requests enable row level security;

-- Profile policies
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users read own prefs" on public.user_preferences for select using (auth.uid() = user_id or public.is_admin());
create policy "Users update own prefs" on public.user_preferences for update using (auth.uid() = user_id);
create policy "Users insert own prefs" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users manage age ack" on public.age_acknowledgments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public reference data readable by authenticated users
create policy "Auth read sports" on public.sports for select to authenticated using (true);
create policy "Auth read leagues" on public.leagues for select to authenticated using (true);
create policy "Auth read teams" on public.teams for select to authenticated using (true);
create policy "Auth read players" on public.players for select to authenticated using (true);
create policy "Auth read events" on public.events for select to authenticated using (true);
create policy "Auth read markets" on public.markets for select to authenticated using (true);
create policy "Auth read outcomes" on public.outcomes for select to authenticated using (true);
create policy "Auth read sportsbooks" on public.sportsbook_operators for select to authenticated using (true);
create policy "Auth read odds" on public.odds_snapshots for select to authenticated using (true);
create policy "Auth read line moves" on public.line_movements for select to authenticated using (true);
create policy "Auth read injuries" on public.injuries for select to authenticated using (true);
create policy "Auth read stats" on public.statistics for select to authenticated using (true);
create policy "Auth read predictions" on public.model_predictions for select to authenticated using (true);
create policy "Auth read ev" on public.ev_opportunities for select to authenticated using (true);
create policy "Auth read arb" on public.arbitrage_opportunities for select to authenticated using (true);
create policy "Auth read active affiliates" on public.affiliate_partners for select to authenticated using (is_active = true or public.is_admin());
create policy "Auth read feature flags" on public.feature_flags for select to authenticated using (true);

-- User-owned data
create policy "Users manage bets" on public.tracked_bets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage bankroll settings" on public.bankroll_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage bankroll entries" on public.bankroll_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage watchlists" on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage alerts" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage ai conversations" on public.ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read ai messages" on public.ai_messages for select using (
  exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);
create policy "Users insert ai messages" on public.ai_messages for insert with check (
  exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);
create policy "Users manage saved analyses" on public.saved_analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own subscription" on public.subscriptions for select using (auth.uid() = user_id or public.is_admin());
create policy "Users read own entitlements" on public.subscription_entitlements for select using (
  exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_admin()))
);
create policy "Users insert support" on public.support_requests for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own support" on public.support_requests for select using (auth.uid() = user_id or public.is_admin());
create policy "Users insert affiliate clicks" on public.affiliate_clicks for insert with check (auth.uid() = user_id or user_id is null);

-- Admin policies
create policy "Admin all audit" on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin manage flags" on public.feature_flags for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin manage affiliates" on public.affiliate_partners for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin read clicks" on public.affiliate_clicks for select using (public.is_admin());
