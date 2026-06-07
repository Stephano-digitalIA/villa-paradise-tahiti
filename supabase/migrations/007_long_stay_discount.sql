-- 007_long_stay_discount.sql
-- Records the long-stay discount applied to a reservation.
-- A stay of 14+ nights gets 10% off the accommodation (villa nights + cleaning fee).
-- Stored so each reservation reconciles: subtotal − long_stay_discount + taxes = total.

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS long_stay_discount numeric(10,2) DEFAULT 0;
