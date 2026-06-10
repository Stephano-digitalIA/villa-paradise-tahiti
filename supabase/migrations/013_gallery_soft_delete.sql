-- 013_gallery_soft_delete.sql
-- Soft-delete / trash for gallery photos. `deleted_at IS NULL` = live; a non-null
-- timestamp = in the trash (hidden from the site and the main admin grid, but the
-- Storage file is kept and the row can be restored). Permanent deletion (row +
-- Storage file) stays available from the trash. Apply manually in the SQL editor.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
