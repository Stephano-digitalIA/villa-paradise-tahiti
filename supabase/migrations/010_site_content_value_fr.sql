-- 010_site_content_value_fr.sql
-- Bilingual admin (FR→EN): store the French *source* alongside the published
-- English value. `value` stays the English text read by the public site
-- (unchanged read path); `value_fr` holds the operator's French source so it
-- is pre-filled on re-edit. Apply manually via the Supabase SQL editor.

ALTER TABLE site_content
  ADD COLUMN IF NOT EXISTS value_fr text NOT NULL DEFAULT '';
