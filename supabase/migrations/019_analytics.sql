-- 019_analytics.sql
-- First-party, cookie-free audience measurement.
--
-- What is deliberately NOT stored: no cookie, no IP address, no user agent
-- string, no identifier that survives the day. `visitor_day` is a truncated
-- hash of the visitor's IP, their user agent and a salt that changes every
-- day, so two visits by the same person count as one on the same day and
-- cannot be linked across days by anyone, including us. That is what keeps
-- this outside the consent-banner rules, and it is why every visitor is
-- counted rather than only the 40 to 60% who accept a banner.
--
-- Rows are events, not sessions. Aggregation happens at read time in the
-- admin: a villa site sees thousands of rows a month, not millions, so a
-- summary table would be premature.
--
-- Apply manually via the Supabase SQL editor: select everything, run once.
-- Safe to run again.

CREATE TABLE IF NOT EXISTS analytics_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- 'page_view' or a named event such as 'photo_view'.
  kind         text NOT NULL DEFAULT 'page_view',
  -- Path only, never the query string: it can carry an email or a token.
  path         text NOT NULL,
  -- Free label for named events, e.g. which photo was opened.
  label        text,
  -- Where the visit came from, bucketed on write so no full referrer URL is
  -- kept: 'direct', 'search', 'social', 'referral'.
  source       text NOT NULL DEFAULT 'direct',
  -- Referring host only, never the full URL. Null for direct visits.
  referrer_host text,
  -- Two-letter country from the CDN edge, when it provides one.
  country      text,
  -- 'mobile', 'tablet' or 'desktop', derived on write.
  device       text NOT NULL DEFAULT 'desktop',
  -- Daily, salted, truncated hash. Not reversible, not stable across days.
  visitor_day  text NOT NULL,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

-- Every admin query filters on a date range first.
CREATE INDEX IF NOT EXISTS analytics_events_occurred_idx
  ON analytics_events (occurred_at DESC);

-- Top pages and the funnel both group by path inside a range.
CREATE INDEX IF NOT EXISTS analytics_events_path_idx
  ON analytics_events (path, occurred_at DESC);

-- Counting distinct visitors per day is the most expensive read.
CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx
  ON analytics_events (visitor_day, occurred_at DESC);

-- RLS on with no policy: the anon key can neither read the audience data nor
-- write fake rows. The collector runs server-side with the service role.
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
