-- 016_newsletter.sql
-- Newsletter: subscriber list + a record of what was sent.
--
-- Single opt-in, as chosen by the operator: an address is subscribed the moment
-- the visitor submits, and receives a welcome email straight away. There is no
-- confirmation step, so `unsubscribe_token` matters more than usual: it is the
-- only thing standing between a wrongly entered address and a person who cannot
-- get out. Every newsletter carries a link built from it.
--
-- Apply manually via the Supabase SQL editor (this project has no migration
-- runner), the same way as migrations 009 to 015.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stored lower-cased and trimmed by the API so the unique index actually
  -- prevents duplicates: Jean@X.com and jean@x.com are the same inbox.
  email              text NOT NULL UNIQUE,
  status             text NOT NULL DEFAULT 'subscribed'
                       CHECK (status IN ('subscribed', 'unsubscribed')),
  -- Random, unguessable, and unique: it authenticates a one-click unsubscribe
  -- without asking the person to log in.
  unsubscribe_token  text NOT NULL UNIQUE,
  -- Where the address came from, so a future second form stays distinguishable.
  source             text NOT NULL DEFAULT 'blog',
  created_at         timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at    timestamptz
);

-- The send list is always "everyone still subscribed", so index that.
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON newsletter_subscribers (status);

-- One row per newsletter actually sent. Kept for two reasons: the operator can
-- see what went out and when, and re-sending the same text by accident becomes
-- visible rather than silent.
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          text NOT NULL,
  body             text NOT NULL,
  -- Number of addresses the send was attempted on, and how many Resend accepted.
  recipients_count integer NOT NULL DEFAULT 0,
  delivered_count  integer NOT NULL DEFAULT 0,
  -- Null while a draft, set when sent. A test send never writes a row.
  sent_at          timestamptz,
  sent_by          text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- No public policy on either table. RLS is on and nothing grants anon access,
-- so the anon key cannot read the subscriber list or the campaign history.
-- Every write goes through a server route holding the service role key.
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns   ENABLE ROW LEVEL SECURITY;
