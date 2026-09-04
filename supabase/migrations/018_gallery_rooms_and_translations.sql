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
-- Apply manually via the Supabase SQL editor: select everything, run once.
-- Safe to run again, every statement tolerates already having been applied.
--
-- An earlier version of this file guarded the constraint with a DO $$ ... $$
-- block. Dollar-quoting is the usual casualty of a partial paste, and the file
-- silently did nothing. It is written as plain statements now.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS room_number smallint;

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}';

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so drop then add. DROP ... IF
-- EXISTS never fails, which makes the pair repeatable. Five rooms is what the
-- villa has; raise the bound here if that ever changes.
ALTER TABLE gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_room_number_range;

ALTER TABLE gallery_items
  ADD CONSTRAINT gallery_items_room_number_range
  CHECK (room_number IS NULL OR (room_number BETWEEN 1 AND 5));

-- The public gallery groups bedrooms by room, so index the pair it filters on.
CREATE INDEX IF NOT EXISTS gallery_items_category_room_idx
  ON gallery_items (category, room_number);
