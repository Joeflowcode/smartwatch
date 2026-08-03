-- Seed reference data for local / beta development

insert into public.sports (id, name, slug) values
  ('nba', 'Basketball', 'nba'),
  ('nfl', 'Football', 'nfl'),
  ('mlb', 'Baseball', 'mlb'),
  ('nhl', 'Hockey', 'nhl')
on conflict (id) do nothing;

insert into public.leagues (id, sport_id, name, slug) values
  ('nba', 'nba', 'NBA', 'nba'),
  ('nfl', 'nfl', 'NFL', 'nfl'),
  ('mlb', 'mlb', 'MLB', 'mlb'),
  ('nhl', 'nhl', 'NHL', 'nhl')
on conflict (id) do nothing;

insert into public.teams (id, league_id, name, abbreviation) values
  ('bos', 'nba', 'Boston Celtics', 'BOS'),
  ('nyk', 'nba', 'New York Knicks', 'NYK'),
  ('kc', 'nfl', 'Kansas City Chiefs', 'KC'),
  ('buf', 'nfl', 'Buffalo Bills', 'BUF'),
  ('lad', 'mlb', 'Los Angeles Dodgers', 'LAD'),
  ('sd', 'mlb', 'San Diego Padres', 'SD'),
  ('edm', 'nhl', 'Edmonton Oilers', 'EDM'),
  ('col', 'nhl', 'Colorado Avalanche', 'COL')
on conflict (id) do nothing;

insert into public.sportsbook_operators (id, name, slug) values
  ('draftkings', 'DraftKings', 'draftkings'),
  ('fanduel', 'FanDuel', 'fanduel'),
  ('betmgm', 'BetMGM', 'betmgm')
on conflict (id) do nothing;

insert into public.feature_flags (key, description, enabled) values
  ('arbitrageAlerts', 'Arbitrage alert notifications', false),
  ('playerPropModeling', 'Player prop modeling', false),
  ('creatorWorkspaces', 'Creator / pro workspaces', false),
  ('publicApi', 'Public developer API', false),
  ('sportsbookConnections', 'Automated sportsbook account connections', false)
on conflict (key) do nothing;

-- Sample upcoming events (relative times resolved at insert)
insert into public.events (id, sport_id, league_id, home_team_id, away_team_id, starts_at, venue, status) values
  ('evt-nba-1', 'nba', 'nba', 'bos', 'nyk', now() + interval '6 hours', 'TD Garden', 'scheduled'),
  ('evt-nfl-1', 'nfl', 'nfl', 'kc', 'buf', now() + interval '30 hours', 'Arrowhead Stadium', 'scheduled'),
  ('evt-mlb-1', 'mlb', 'mlb', 'lad', 'sd', now() + interval '5 hours', 'Dodger Stadium', 'scheduled'),
  ('evt-nhl-1', 'nhl', 'nhl', 'edm', 'col', now() + interval '28 hours', 'Rogers Place', 'scheduled')
on conflict (id) do nothing;
