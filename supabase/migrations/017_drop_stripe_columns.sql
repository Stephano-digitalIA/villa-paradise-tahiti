-- 017_drop_stripe_columns.sql
-- Stripe was removed from the code: every payment is settled by PayPal, and
-- the "Credit / debit card" option is PayPal's guest checkout rather than a
-- second processor. These two columns can no longer be written by anything.
--
-- Safe to run: the table held zero reservations when Stripe was removed, so
-- there is no data to lose. Verify that for yourself before running it if any
-- time has passed:
--
--   SELECT count(*) FROM reservations
--    WHERE stripe_session_id IS NOT NULL
--       OR stripe_payment_intent_id IS NOT NULL;
--
-- If that returns anything other than 0, do NOT run this file. Those rows
-- record real money taken through Stripe and the columns are their only trace.
--
-- Unlike the other migrations this one is optional: leaving the columns in
-- place costs nothing but a little confusion. Apply manually via the Supabase
-- SQL editor.

ALTER TABLE reservations
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS stripe_payment_intent_id;
