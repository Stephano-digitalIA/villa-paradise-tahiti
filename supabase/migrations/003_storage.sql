-- ============================================================
-- 003_storage.sql — Villa Paradise Tahiti
-- Documentation des buckets Storage Supabase
-- NB : les buckets ne se créent PAS via SQL — uniquement via
--      l'API Supabase ou le Dashboard.
--      Ce fichier sert de référence/documentation.
-- ============================================================

-- ============================================================
-- BUCKETS À CRÉER MANUELLEMENT (Dashboard → Storage → New bucket)
-- ============================================================

-- Bucket : villa-media
--   Visibilité : Public
--   Max file size : 50 MB
--   Allowed MIME types : image/*, video/*
--   Usage : hero image/video, galerie villa

-- Bucket : experiences-media
--   Visibilité : Public
--   Max file size : 20 MB
--   Allowed MIME types : image/*
--   Usage : covers et galleries des expériences

-- Bucket : blog-media
--   Visibilité : Public
--   Max file size : 20 MB
--   Allowed MIME types : image/*
--   Usage : covers des articles de blog

-- Bucket : reviews-media
--   Visibilité : Public
--   Max file size : 5 MB
--   Allowed MIME types : image/*
--   Usage : avatars des auteurs d'avis

-- Bucket : uploads
--   Visibilité : Privé
--   Max file size : 50 MB
--   Allowed MIME types : image/*, application/pdf
--   Usage : zone de transit temporaire (purge auto 24h via cron Edge Function)

-- ============================================================
-- POLICIES STORAGE (Dashboard → Storage → [bucket] → Policies)
-- ============================================================

-- villa-media, experiences-media, blog-media, reviews-media :
--   SELECT  : rôle anon (public, lecture libre)
--   INSERT  : service_role uniquement (admin via API)
--   UPDATE  : service_role uniquement
--   DELETE  : service_role uniquement

-- uploads :
--   SELECT  : service_role uniquement
--   INSERT  : service_role uniquement
--   UPDATE  : service_role uniquement
--   DELETE  : service_role uniquement

-- ============================================================
-- CONVENTIONS DE CHEMINS (à utiliser dans lib/supabase/storage.ts)
-- ============================================================

-- Villa
--   Hero image  : villa-media/hero/{filename}
--   Hero video  : villa-media/video/{filename}
--   Galerie     : villa-media/gallery/{filename}

-- Expériences
--   Cover       : experiences-media/covers/{slug}.{ext}
--   Galerie     : experiences-media/gallery/{slug}-{n}.{ext}

-- Blog
--   Cover       : blog-media/covers/{slug}.{ext}

-- Avis clients
--   Avatar      : reviews-media/avatars/{id}.{ext}

-- Uploads temporaires
--   Transit     : uploads/{uuid}/{filename}

-- ============================================================
-- HELPER SQL : générer une URL publique depuis le backend
-- (copier dans une Edge Function si besoin)
-- ============================================================

-- SELECT storage.foldername(name) FROM storage.objects
--   WHERE bucket_id = 'villa-media';

-- Exemple TypeScript (supabase-js) :
-- const { data } = supabase.storage
--   .from('villa-media')
--   .getPublicUrl('hero/hero-main.jpg')
-- → data.publicUrl
