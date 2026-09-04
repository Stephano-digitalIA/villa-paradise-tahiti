-- 018_gallery_rooms_and_translations.sql
-- Two additions to gallery_items, both driven by the admin gallery screen.
--
-- 1. `room_number` splits the "bedrooms" category into the five actual rooms.
--    Deliberately NOT a widening of the `category` CHECK: a room is a level
--    below a category, and folding them into one list would break the public
--    filter chips, which map one chip per category. The column stays null for
--    every photo that is not of a bedroom.
--
-- 2. `translations` brings this table in line with villa, experiences, posts,
--    reviews and faqs (migrations 011 and 012). It holds the French source for
--    `alt` and `caption`; the columns themselves stay the published English.
--    gallery_items was the only content table without it, so photo captions
--    had nowhere to store French.
--
-- Apply manually via the Supabase SQL editor (this project has no migration
-- runner), the same way as migrations 009 to 017.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS room_number  smallint,
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so guard it by name. Five
-- rooms is what the villa has; raise the bound here if that ever changes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gallery_items_room_number_range'
  ) THEN
    ALTER TABLE gallery_items
      ADD CONSTRAINT gallery_items_room_number_range
      CHECK (room_number IS NULL OR (room_number BETWEEN 1 AND 5));
  END IF;
END $$;

-- The public gallery groups bedrooms by room, so index the pair it filters on.
CREATE INDEX IF NOT EXISTS gallery_items_category_room_idx
  ON gallery_items (category, room_number);
