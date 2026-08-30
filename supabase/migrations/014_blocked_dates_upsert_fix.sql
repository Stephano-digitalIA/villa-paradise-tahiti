-- ============================================================
-- 014_blocked_dates_upsert_fix.sql — Villa Paradise Tahiti
-- Make the iCal upsert work: replace the partial unique index with a
-- plain one so ON CONFLICT can infer it.
-- ============================================================

-- Symptom this fixes: every iCal sync failed with
--   42P10 "there is no unique or exclusion constraint matching the
--          ON CONFLICT specification"
-- so no platform booking (Airbnb / Booking.com / VRBO) was ever written
-- to blocked_dates, and no date change was propagated. The stale-row
-- DELETE still ran, leaving the sync silently write-dead.
--
-- Cause: 006 created the index WHERE source_ref IS NOT NULL. PostgreSQL
-- only infers a *partial* index when the statement repeats that same
-- predicate, and PostgREST (lib/ical/persist.ts → .upsert with
-- onConflict: 'source,source_ref') does not emit one.
--
-- The predicate was there to let manual blocks (owner / maintenance /
-- direct_booking) leave source_ref empty. It is unnecessary: a UNIQUE
-- constraint treats every NULL as distinct, so any number of rows may
-- still omit source_ref.

DROP INDEX IF EXISTS blocked_dates_source_ref_unique;

ALTER TABLE blocked_dates
  DROP CONSTRAINT IF EXISTS blocked_dates_source_ref_unique;

ALTER TABLE blocked_dates
  ADD CONSTRAINT blocked_dates_source_ref_unique
  UNIQUE (source, source_ref);
