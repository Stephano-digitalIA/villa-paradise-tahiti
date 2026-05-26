-- ============================================================
-- 004_access_token.sql — Villa Paradise Tahiti
-- Ajoute access_token sur reservations pour les liens magiques clients
-- ============================================================

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS access_token text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations (access_token);
