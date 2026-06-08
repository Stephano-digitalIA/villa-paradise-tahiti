-- 009_site_content.sql
-- Editable marketing copy: a flat key → value store for page text blocks
-- (homepage sections, later villa/rates headers and legal pages).
-- Defaults live in code (lib/content/registry.ts); a row here overrides one.

CREATE TABLE IF NOT EXISTS site_content (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Public site reads it (anon, read-only); writes go through the service role.
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content public read" ON site_content;
CREATE POLICY "site_content public read"
  ON site_content FOR SELECT
  USING (true);
