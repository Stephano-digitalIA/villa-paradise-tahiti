-- ============================================================
-- 004_crm.sql — Villa Paradise Tahiti
-- CRM admin : enrichissement customers + tags + notes + vue agrégée
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Enrichissements `customers`
-- ─────────────────────────────────────────────────────────────
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS acquisition_source text
    CHECK (acquisition_source IN ('direct','airbnb','booking','vrbo','referral','manual','imported')),
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS dietary_notes text,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_customers_anonymized
  ON customers (anonymized_at) WHERE anonymized_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_source
  ON customers (acquisition_source);
CREATE INDEX IF NOT EXISTS idx_customers_email_lower
  ON customers (LOWER(email));

-- ─────────────────────────────────────────────────────────────
-- 2. Catalogue de tags partagés (VIP, Répétitif, Allergique, …)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text UNIQUE NOT NULL,
  color       text NOT NULL DEFAULT 'gold'
              CHECK (color IN ('gold','coral','lagoon','leaf','midnight','sand')),
  created_at  timestamptz DEFAULT now()
);

-- Seed de quelques tags utiles
INSERT INTO customer_tags (label, color) VALUES
  ('VIP',         'gold'),
  ('Repeat',      'lagoon'),
  ('Honeymoon',   'coral'),
  ('Allergic',    'coral'),
  ('Press',       'midnight'),
  ('Influencer',  'leaf')
ON CONFLICT (label) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. Relation N-N tags ↔ clients
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (customer_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_cta_tag ON customer_tag_assignments (tag_id);

-- ─────────────────────────────────────────────────────────────
-- 4. Notes privées timeline (soft delete)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer
  ON customer_notes (customer_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 5. email_logs : ajouter customer_id pour requêtes plus rapides
-- ─────────────────────────────────────────────────────────────
ALTER TABLE email_logs
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_customer
  ON email_logs (customer_id, sent_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 6. Vue agrégée `customer_summary` — utilisée par la liste admin
-- ─────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS customer_summary;
CREATE VIEW customer_summary AS
SELECT
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  c.phone,
  c.country,
  c.city,
  c.zip_code,
  c.accept_marketing,
  c.marketing_consent_at,
  c.acquisition_source,
  c.preferred_language,
  c.dietary_notes,
  c.anonymized_at,
  c.created_at,
  c.updated_at,
  COALESCE(s.n_stays, 0)            AS n_stays,
  COALESCE(s.total_revenue, 0)      AS total_revenue,
  s.last_check_in,
  s.next_check_in,
  COALESCE(t.tags, ARRAY[]::text[]) AS tags
FROM customers c
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)                                                        AS n_stays,
    SUM(total)                                                      AS total_revenue,
    MAX(check_in)  FILTER (WHERE check_in < CURRENT_DATE)           AS last_check_in,
    MIN(check_in)  FILTER (WHERE check_in >= CURRENT_DATE)          AS next_check_in
  FROM reservations
  WHERE customer_id = c.id
    AND payment_status IN ('deposit_paid','fully_paid')
) s ON TRUE
LEFT JOIN LATERAL (
  SELECT ARRAY_AGG(ct.label ORDER BY ct.label) AS tags
  FROM customer_tag_assignments cta
  JOIN customer_tags ct ON ct.id = cta.tag_id
  WHERE cta.customer_id = c.id
) t ON TRUE;
