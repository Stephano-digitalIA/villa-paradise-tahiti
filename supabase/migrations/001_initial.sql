-- ============================================================
-- 001_initial.sql — Villa Paradise Tahiti
-- Schema complet : toutes les tables dans l'ordre des FK
-- ============================================================

-- 1. settings (singleton)
CREATE TABLE IF NOT EXISTS settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name               text NOT NULL DEFAULT 'Villa Paradise Tahiti',
  site_description        text,
  contact_email           text,
  contact_phone           text,
  whatsapp_number         text,
  social_instagram        text,
  social_facebook         text,
  social_pinterest        text,
  social_tiktok           text,
  default_min_nights      integer NOT NULL DEFAULT 5,
  default_deposit_percent numeric(5,2) NOT NULL DEFAULT 30,
  default_nightly_rate_usd numeric(10,2) DEFAULT 690,
  cleaning_fee_usd        numeric(10,2) DEFAULT 150,
  rate_low_usd            numeric(10,2) DEFAULT 590,
  rate_high_usd           numeric(10,2) DEFAULT 890,
  rate_peak_usd           numeric(10,2) DEFAULT 1290,
  season_windows          jsonb DEFAULT '[]',
  cancellation_policy     text,
  terms_of_service        text,
  privacy_policy          text,
  booking_terms_url       text,
  response_time_hours     integer DEFAULT 4,
  updated_at              timestamptz DEFAULT now()
);

-- 2. villa (singleton)
CREATE TABLE IF NOT EXISTS villa (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL DEFAULT 'Villa Paradise Tahiti',
  tagline         text,
  description     text,
  bedrooms        integer DEFAULT 4,
  bathrooms       integer DEFAULT 4,
  max_guests      integer DEFAULT 8,
  size_sqm        numeric(8,2),
  size_sqft       numeric(8,2),
  has_pool        boolean DEFAULT true,
  has_jacuzzi     boolean DEFAULT false,
  has_ac          boolean DEFAULT true,
  has_wifi        boolean DEFAULT true,
  has_parking     boolean DEFAULT true,
  amenities       text[] DEFAULT '{}',
  address         text,
  city            text DEFAULT 'Punaauia',
  country         text DEFAULT 'French Polynesia',
  latitude        numeric(10,6),
  longitude       numeric(10,6),
  hero_video_url  text,
  hero_image_url  text,
  hero_image_alt  text,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  updated_at      timestamptz DEFAULT now()
);

-- 3. gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   text NOT NULL,
  alt         text NOT NULL,
  caption     text,
  category    text NOT NULL CHECK (category IN ('exterior','interior','pool','lagoon','bedrooms','night','experiences','sunset')),
  width       integer,
  height      integer,
  sort_order  integer DEFAULT 0,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 4. excursion_providers
CREATE TABLE IF NOT EXISTS excursion_providers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  contact_email      text,
  contact_phone      text,
  website            text,
  instagram          text,
  commission_percent numeric(5,2),
  notes              text,
  services           text[] DEFAULT '{}',
  active             boolean DEFAULT true,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- 5. experiences
CREATE TABLE IF NOT EXISTS experiences (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,
  title             text NOT NULL,
  category          text NOT NULL CHECK (category IN ('excursion','evening','dining','wellness','cultural','adventure')),
  short_description text NOT NULL,
  description       text,
  cover_image_url   text,
  cover_image_alt   text,
  price_usd         numeric(10,2) NOT NULL,
  price_unit        text NOT NULL CHECK (price_unit IN ('per_person','flat','per_group')),
  min_guests        integer,
  max_guests        integer,
  duration          text,
  meeting_point     text,
  seasonal          boolean DEFAULT false,
  season_start      date,
  season_end        date,
  provider_id       uuid REFERENCES excursion_providers(id) ON DELETE SET NULL,
  highlights        text[] DEFAULT '{}',
  popularity        integer DEFAULT 50 CHECK (popularity BETWEEN 0 AND 100),
  featured          boolean DEFAULT false,
  active            boolean DEFAULT true,
  sort_order        integer DEFAULT 0,
  seo_title         text,
  seo_description   text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- 6. experience_gallery
CREATE TABLE IF NOT EXISTS experience_gallery (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  alt           text,
  sort_order    integer DEFAULT 0
);

-- 7. reviews
CREATE TABLE IF NOT EXISTS reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name      text NOT NULL,
  author_location  text,
  author_photo_url text,
  rating           integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            text NOT NULL,
  body             text NOT NULL,
  stay_from        date,
  stay_to          date,
  verified         boolean DEFAULT false,
  source           text NOT NULL CHECK (source IN ('direct','airbnb','vrbo','google','tripadvisor')),
  featured         boolean DEFAULT false,
  published_at     timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now()
);

-- 8. posts
CREATE TABLE IF NOT EXISTS posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  excerpt          text NOT NULL,
  body             text,
  cover_image_url  text,
  cover_image_alt  text,
  author_name      text,
  author_photo_url text,
  author_bio       text,
  tags             text[] DEFAULT '{}',
  reading_time_min integer,
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  og_image_url     text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- 9. faqs
CREATE TABLE IF NOT EXISTS faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  category    text NOT NULL CHECK (category IN ('booking','villa','tahiti','payment','experiences')),
  sort_order  integer DEFAULT 0,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 10. admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text UNIQUE NOT NULL,
  full_name  text,
  avatar_url text,
  role       text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','assistant','developer','viewer')),
  created_at timestamptz DEFAULT now()
);

-- 11. customers
CREATE TABLE IF NOT EXISTS customers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text UNIQUE NOT NULL,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  phone            text,
  country          text,
  city             text,
  zip_code         text,
  accept_marketing boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- 12. reservations
CREATE TABLE IF NOT EXISTS reservations (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_ref          text UNIQUE NOT NULL,
  customer_id              uuid REFERENCES customers(id) ON DELETE RESTRICT,
  check_in                 date NOT NULL,
  check_out                date NOT NULL,
  num_guests               integer NOT NULL,
  special_requests         text,
  arrival_flight           text,
  departure_flight         text,
  nightly_rate_usd         numeric(10,2),
  season                   text,
  villa_subtotal           numeric(10,2),
  cleaning_fee             numeric(10,2),
  experiences_total        numeric(10,2),
  subtotal                 numeric(10,2),
  taxes                    numeric(10,2) DEFAULT 0,
  total                    numeric(10,2),
  deposit_amount           numeric(10,2),
  balance_amount           numeric(10,2),
  selected_experiences     jsonb DEFAULT '[]',
  payment_method           text CHECK (payment_method IN ('stripe','paypal','manual')),
  payment_status           text NOT NULL DEFAULT 'pending'
                           CHECK (payment_status IN ('pending','deposit_paid','fully_paid','cancelled','refunded')),
  deposit_paid_at          timestamptz,
  balance_paid_at          timestamptz,
  stripe_session_id        text,
  stripe_payment_intent_id text,
  paypal_order_id          text,
  check_in_confirmed_at    timestamptz,
  check_out_confirmed_at   timestamptz,
  cancelled_at             timestamptz,
  cancellation_reason      text,
  internal_notes           text,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations (customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates    ON reservations (check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status   ON reservations (payment_status);
CREATE INDEX IF NOT EXISTS idx_reservations_ref      ON reservations (reservation_ref);

-- 13. payment_events
CREATE TABLE IF NOT EXISTS payment_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  event_id       text UNIQUE NOT NULL,
  event_type     text NOT NULL,
  payload        jsonb,
  processed_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_res ON payment_events (reservation_id);

-- 14. blocked_dates
CREATE TABLE IF NOT EXISTS blocked_dates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_from   date NOT NULL,
  blocked_to     date NOT NULL,
  reason         text,
  source         text NOT NULL CHECK (source IN ('airbnb','vrbo','direct_booking','owner','maintenance')),
  source_ref     text,
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  CONSTRAINT valid_range CHECK (blocked_from <= blocked_to)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON blocked_dates (blocked_from, blocked_to);

-- 15. email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id   uuid REFERENCES reservations(id) ON DELETE SET NULL,
  email_type       text NOT NULL,
  recipient_email  text NOT NULL,
  status           text DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  resend_message_id text,
  error_message    text,
  sent_at          timestamptz DEFAULT now()
);

-- 16. contact_inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      text NOT NULL,
  email          text NOT NULL,
  phone          text,
  check_in       date,
  check_out      date,
  guests         integer,
  message        text NOT NULL,
  replied        boolean DEFAULT false,
  replied_at     timestamptz,
  internal_notes text,
  created_at     timestamptz DEFAULT now()
);
