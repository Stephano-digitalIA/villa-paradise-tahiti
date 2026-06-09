-- 011_villa_translations.sql
-- Bilingual admin (FR→EN) for the Villa content. Adds a jsonb column holding the
-- French *source* per translatable text field ({ name, tagline, description,
-- hero_image_alt, amenities, seo_title, seo_description }). The existing English
-- columns stay the published values read by the public site (read path
-- unchanged). Apply manually via the Supabase SQL editor.

ALTER TABLE villa
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';
