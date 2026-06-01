-- ============================================================
-- 006_blocked_dates_ical.sql — Villa Paradise Tahiti
-- Extend blocked_dates to support Booking.com + enable iCal upsert pattern
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Allow source = 'booking' (Booking.com iCal feed)
-- ─────────────────────────────────────────────────────────────
-- PostgreSQL doesn't let us ALTER a CHECK constraint in place; we drop
-- the old one and recreate it with the extended set. Constraint name
-- is the implicit one PostgreSQL generated for the original CHECK.
ALTER TABLE blocked_dates DROP CONSTRAINT IF EXISTS blocked_dates_source_check;
ALTER TABLE blocked_dates
  ADD CONSTRAINT blocked_dates_source_check
  CHECK (source IN (
    'airbnb',
    'booking',
    'vrbo',
    'direct_booking',
    'owner',
    'maintenance'
  ));

-- ─────────────────────────────────────────────────────────────
-- 2. Unique index on (source, source_ref) — required for ON CONFLICT
--    upsert pattern in the iCal sync route.
--
-- Partial index : we only enforce uniqueness when source_ref is non-null
-- (the iCal VEVENT UID). Manual entries (source='owner', 'maintenance',
-- 'direct_booking' from payment webhooks) may legitimately omit it.
-- ─────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS blocked_dates_source_ref_unique
  ON blocked_dates (source, source_ref)
  WHERE source_ref IS NOT NULL;
