-- 012_content_translations.sql
-- Bilingual admin (FR→EN) for the remaining content surfaces. Each table gets a
-- jsonb column holding the French *source* per translatable text field. The
-- existing English columns stay the published values read by the public site
-- (read path unchanged). Apply manually via the Supabase SQL editor.

ALTER TABLE experiences         ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
ALTER TABLE posts               ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
ALTER TABLE reviews             ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
ALTER TABLE faqs                ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
ALTER TABLE excursion_providers ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
