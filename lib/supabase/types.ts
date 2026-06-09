// ─────────────────────────────────────────────────────────────────────────────
// Villa Paradise Tahiti — Supabase Types
// Derived from the 16-table schema. Use these everywhere instead of raw Supabase generics.
// Run `npx supabase gen types typescript` later to replace Database with auto-generated types.
// ─────────────────────────────────────────────────────────────────────────────

export type Settings = {
  id: string
  site_name: string
  site_description: string | null
  contact_email: string | null
  contact_phone: string | null
  whatsapp_number: string | null
  social_instagram: string | null
  social_facebook: string | null
  social_pinterest: string | null
  social_tiktok: string | null
  default_min_nights: number
  default_deposit_percent: number
  default_nightly_rate_usd: number | null
  cleaning_fee_usd: number | null
  rate_low_usd: number | null
  rate_high_usd: number | null
  rate_peak_usd: number | null
  long_stay_min_nights: number | null
  long_stay_discount_percent: number | null
  season_windows: Array<{ from: string; to: string; label: string }>
  cancellation_policy: string | null
  terms_of_service: string | null
  privacy_policy: string | null
  booking_terms_url: string | null
  response_time_hours: number | null
  updated_at: string
}

export type Villa = {
  id: string
  name: string
  tagline: string | null
  description: string | null
  bedrooms: number
  bathrooms: number
  max_guests: number
  size_sqm: number | null
  size_sqft: number | null
  has_pool: boolean
  has_jacuzzi: boolean
  has_ac: boolean
  has_wifi: boolean
  has_parking: boolean
  amenities: string[]
  address: string | null
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  hero_video_url: string | null
  hero_image_url: string | null
  hero_image_alt: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  /** Admin-only FR source per translatable text field; '{}' before migration 011. */
  translations?: Record<string, string>
  updated_at: string
}

export type GalleryCategory =
  | 'exterior'
  | 'interior'
  | 'pool'
  | 'lagoon'
  | 'bedrooms'
  | 'night'
  | 'experiences'
  | 'sunset'

export type GalleryItem = {
  id: string
  image_url: string
  alt: string
  caption: string | null
  category: GalleryCategory
  width: number | null
  height: number | null
  sort_order: number
  active: boolean
  created_at: string
}

export type ExcursionProvider = {
  id: string
  name: string
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  instagram: string | null
  commission_percent: number | null
  notes: string | null
  services: string[]
  active: boolean
  /** Admin-only FR source per translatable field; '{}' before migration 012. */
  translations?: Record<string, string>
  created_at: string
  updated_at: string
}

export type ExperienceCategory =
  | 'excursion'
  | 'evening'
  | 'dining'
  | 'wellness'
  | 'cultural'
  | 'adventure'

export type PriceUnit = 'per_person' | 'flat' | 'per_group'

export type Experience = {
  id: string
  slug: string
  title: string
  category: ExperienceCategory
  short_description: string
  description: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  price_usd: number
  price_unit: PriceUnit
  min_guests: number | null
  max_guests: number | null
  duration: string | null
  meeting_point: string | null
  seasonal: boolean
  season_start: string | null
  season_end: string | null
  provider_id: string | null
  highlights: string[]
  popularity: number
  featured: boolean
  active: boolean
  sort_order: number
  seo_title: string | null
  seo_description: string | null
  /** Admin-only FR source per translatable field; '{}' before migration 012. */
  translations?: Record<string, string>
  created_at: string
  updated_at: string
  // Joined from excursion_providers (optional)
  provider?: Pick<ExcursionProvider, 'id' | 'name' | 'website' | 'instagram'> | null
}

export type ExperienceGalleryItem = {
  id: string
  experience_id: string
  image_url: string
  alt: string | null
  sort_order: number
}

export type ReviewRating = 1 | 2 | 3 | 4 | 5
export type ReviewSource = 'direct' | 'airbnb' | 'vrbo' | 'google' | 'tripadvisor'

export type Review = {
  id: string
  author_name: string
  author_location: string | null
  author_photo_url: string | null
  rating: ReviewRating
  title: string
  body: string
  stay_from: string | null
  stay_to: string | null
  verified: boolean
  source: ReviewSource
  featured: boolean
  published_at: string
  /** Admin-only FR source per translatable field; '{}' before migration 012. */
  translations?: Record<string, string>
  created_at: string
}

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  author_name: string | null
  author_photo_url: string | null
  author_bio: string | null
  tags: string[]
  reading_time_min: number | null
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  /** Admin-only FR source per translatable field; '{}' before migration 012. */
  translations?: Record<string, string>
  created_at: string
  updated_at: string
}

export type FaqCategory = 'booking' | 'villa' | 'tahiti' | 'payment' | 'experiences'

export type FAQ = {
  id: string
  question: string
  answer: string
  category: FaqCategory
  sort_order: number
  active: boolean
  /** Admin-only FR source per translatable field; '{}' before migration 012. */
  translations?: Record<string, string>
  created_at: string
}

export type AdminRole = 'owner' | 'assistant' | 'developer' | 'viewer'

export type AdminUser = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: AdminRole
  created_at: string
}

export type AcquisitionSource =
  | 'direct'
  | 'airbnb'
  | 'booking'
  | 'vrbo'
  | 'referral'
  | 'manual'
  | 'imported'

export type Customer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  country: string | null
  city: string | null
  zip_code: string | null
  accept_marketing: boolean
  acquisition_source: AcquisitionSource | null
  preferred_language: string | null
  dietary_notes: string | null
  marketing_consent_at: string | null
  anonymized_at: string | null
  created_at: string
  updated_at: string
}

export type CustomerTagColor =
  | 'gold'
  | 'coral'
  | 'lagoon'
  | 'leaf'
  | 'midnight'
  | 'sand'

export type CustomerTag = {
  id: string
  label: string
  color: CustomerTagColor
  created_at: string
}

export type CustomerTagAssignment = {
  customer_id: string
  tag_id: string
  assigned_at: string
}

export type CustomerNote = {
  id: string
  customer_id: string
  author_id: string | null
  body: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Row from the `customer_summary` SQL view. */
export type CustomerSummary = Customer & {
  n_stays: number
  total_revenue: number
  last_check_in: string | null
  next_check_in: string | null
  tags: string[]
}

export type PaymentStatus =
  | 'pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'stripe' | 'paypal' | 'manual'

export type SelectedExperienceSnapshot = {
  slug: string
  title: string
  price_usd: number
  price_unit: PriceUnit
  quantity: number
}

export type Reservation = {
  id: string
  reservation_ref: string
  customer_id: string | null
  check_in: string
  check_out: string
  num_guests: number
  special_requests: string | null
  arrival_flight: string | null
  departure_flight: string | null
  nightly_rate_usd: number | null
  season: string | null
  villa_subtotal: number | null
  cleaning_fee: number | null
  experiences_total: number | null
  subtotal: number | null
  long_stay_discount: number | null
  taxes: number | null
  total: number | null
  deposit_amount: number | null
  balance_amount: number | null
  selected_experiences: SelectedExperienceSnapshot[]
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  deposit_paid_at: string | null
  balance_paid_at: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  paypal_order_id: string | null
  check_in_confirmed_at: string | null
  check_out_confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  customer?: Customer | null
}

export type PaymentEvent = {
  id: string
  reservation_id: string | null
  event_id: string
  event_type: string
  payload: Record<string, unknown> | null
  processed_at: string
}

export type BlockedDateSource =
  | 'airbnb'
  | 'booking'
  | 'vrbo'
  | 'direct_booking'
  | 'owner'
  | 'maintenance'

export type BlockedDate = {
  id: string
  blocked_from: string
  blocked_to: string
  reason: string | null
  source: BlockedDateSource
  source_ref: string | null
  reservation_id: string | null
  created_at: string
  updated_at: string
}

export type EmailLogStatus = 'sent' | 'failed' | 'bounced'

export type EmailLog = {
  id: string
  reservation_id: string | null
  customer_id: string | null
  email_type: string
  recipient_email: string
  status: EmailLogStatus
  resend_message_id: string | null
  error_message: string | null
  sent_at: string
}

export type ContactInquiry = {
  id: string
  full_name: string
  email: string
  phone: string | null
  check_in: string | null
  check_out: string | null
  guests: number | null
  message: string
  replied: boolean
  replied_at: string | null
  internal_notes: string | null
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Database type (placeholder — replace with `supabase gen types` output)
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal row shape expected by Supabase JS v2 for a table definition.
 *
 * `TInsert` defaults to a version where every nullable column is also
 * optional, which matches what PostgreSQL allows at INSERT time. Columns
 * that are NOT NULL without a DEFAULT remain required.
 */
type TableDef<TRow, TInsert = Partial<TRow>, TUpdate = Partial<TRow>> = {
  Row: TRow
  Insert: TInsert
  Update: TUpdate
  Relationships: []
}

/** Make every field whose value can be `null` also optional. */
type InsertOf<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K]
} & {
  [K in keyof T as null extends T[K] ? K : never]?: T[K]
}

export type SiteContent = {
  key: string
  value: string
  /** French source text (admin-only); '' before migration 010. */
  value_fr: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      settings: TableDef<Settings, Partial<Settings>>
      villa: TableDef<Villa, Partial<Villa>>
      site_content: TableDef<SiteContent, Partial<SiteContent>>
      gallery_items: TableDef<GalleryItem, InsertOf<Omit<GalleryItem, 'id' | 'created_at'>>>
      excursion_providers: TableDef<
        ExcursionProvider,
        InsertOf<Omit<ExcursionProvider, 'id' | 'created_at' | 'updated_at'>>
      >
      experiences: TableDef<
        Experience,
        InsertOf<Omit<Experience, 'id' | 'created_at' | 'updated_at'>>
      >
      experience_gallery: TableDef<
        ExperienceGalleryItem,
        InsertOf<Omit<ExperienceGalleryItem, 'id'>>
      >
      reviews: TableDef<Review, InsertOf<Omit<Review, 'id' | 'created_at'>>>
      posts: TableDef<Post, InsertOf<Omit<Post, 'id' | 'created_at' | 'updated_at'>>>
      faqs: TableDef<FAQ, InsertOf<Omit<FAQ, 'id' | 'created_at'>>>
      admin_users: TableDef<AdminUser, InsertOf<Omit<AdminUser, 'created_at'>>>
      customers: TableDef<Customer, InsertOf<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>>
      reservations: TableDef<
        Reservation,
        InsertOf<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>
      >
      payment_events: TableDef<
        PaymentEvent,
        InsertOf<Omit<PaymentEvent, 'id' | 'processed_at'>>
      >
      blocked_dates: TableDef<
        BlockedDate,
        InsertOf<Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>>
      >
      email_logs: TableDef<EmailLog, InsertOf<Omit<EmailLog, 'id' | 'sent_at'>>>
      contact_inquiries: TableDef<
        ContactInquiry,
        InsertOf<Omit<ContactInquiry, 'id' | 'created_at'>>
      >
      customer_tags: TableDef<
        CustomerTag,
        InsertOf<Omit<CustomerTag, 'id' | 'created_at'>>
      >
      customer_tag_assignments: TableDef<
        CustomerTagAssignment,
        InsertOf<Omit<CustomerTagAssignment, 'assigned_at'>>
      >
      customer_notes: TableDef<
        CustomerNote,
        InsertOf<Omit<CustomerNote, 'id' | 'created_at' | 'updated_at'>>
      >
    }
    Views: {
      customer_summary: { Row: CustomerSummary; Relationships: [] }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
