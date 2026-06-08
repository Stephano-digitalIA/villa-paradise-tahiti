-- 008_settings_long_stay.sql
-- Make the long-stay discount editable from /admin/settings.
-- Threshold (nights) + percent off the accommodation (villa + cleaning).
-- Defaults mirror the previously hardcoded constants in lib/booking/pricing.ts.

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS long_stay_min_nights        integer       DEFAULT 14,
  ADD COLUMN IF NOT EXISTS long_stay_discount_percent  numeric(5,2)  DEFAULT 10;
