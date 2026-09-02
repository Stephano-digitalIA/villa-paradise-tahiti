-- 015_currency_columns.sql
-- Backfill the repo's record of the USD/EUR feature.
--
-- These four columns already exist in the hosted project: they were applied
-- straight in the Supabase SQL editor when the currency switcher shipped, and
-- the matching migration was never written. The code has depended on them
-- since (settings form, checkout insert, both payment webhooks, confirmation
-- emails, the balance reminder and the admin reservation page), so nothing is
-- broken today. What was broken is the repo's ability to rebuild the database:
-- replaying 001 through 014 produced a schema without them, and the first
-- booking would have failed on insert with no clue as to why.
--
-- Running this against the live project is a no-op, by design: every statement
-- is ADD COLUMN IF NOT EXISTS, so existing columns are left exactly as they
-- are. It only has an effect on a fresh database.
--
-- Definitions mirror what the live columns report through PostgREST (all four
-- nullable; `usd_to_eur_rate` defaults to 0.88, `display_currency` to 'USD').
-- Precision is not exposed by that route, so the scales below follow the
-- sibling columns of each table: numeric(10,2) for money on `reservations`,
-- and 4 decimals for the exchange rate because /admin/settings edits it in
-- steps of 0.0001.
--
-- Apply manually via the Supabase SQL editor (this project has no migration
-- runner), the same way as migrations 009 to 014.

-- Public currency switcher: the USD to EUR rate, admin-managed.
-- Read by app/layout.tsx into CurrencyProvider, and by the checkout route as
-- the server-authoritative rate. The client only ever picks a currency code.
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS usd_to_eur_rate numeric(10,4) DEFAULT 0.88;

-- What the guest was actually charged, alongside the canonical USD ledger.
-- The pricing engine and every *_amount column stay in USD; these three record
-- the charge as it happened, so an EUR booking can be reconciled later even if
-- the admin rate moves. `exchange_rate` stays NULL for a USD charge.
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS display_currency        text          DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS exchange_rate           numeric(10,4),
  ADD COLUMN IF NOT EXISTS amount_charged_currency numeric(10,2);

-- Note: `display_currency` is deliberately left as plain text with no CHECK
-- constraint, to match the live column. The allowed values are enforced in the
-- API instead (z.enum(['USD','EUR']) in app/api/checkout/route.ts). Adding a
-- constraint here would make a rebuilt database stricter than production,
-- which is the same kind of drift this migration exists to end.
