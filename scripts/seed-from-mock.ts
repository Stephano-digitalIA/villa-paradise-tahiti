/**
 * Seed Supabase from lib/sanity/mock-data.ts.
 *
 * Why: the admin reads/writes Supabase but the public site reads the
 * Sanity mock (because `NEXT_PUBLIC_SANITY_PROJECT_ID=mock`). This script
 * mirrors the mock content into the Supabase tables so the admin shows
 * the same content the visitor sees, and the operator can edit it.
 *
 * Strategy:
 *   - villa / settings  : singleton — find-or-update, else insert
 *   - other tables      : DELETE all rows, then INSERT fresh from mock
 *
 * Run (PowerShell):
 *   npx tsx --env-file=.env.local scripts/seed-from-mock.ts
 *
 * Safe to re-run — idempotent for content tables (delete-then-insert).
 */

import { createClient } from '@supabase/supabase-js'

import {
  mockExperiences,
  mockFaqs,
  mockPosts,
  mockReviews,
  mockSettings,
  mockVilla,
} from '../lib/sanity/mock-data'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function url(image: { url?: string; asset?: { url?: string } } | null | undefined): string | null {
  return image?.url ?? image?.asset?.url ?? null
}
function alt(image: { alt?: string } | null | undefined): string | null {
  return image?.alt ?? null
}

async function main() {

/* ─── 1. Villa singleton ──────────────────────────────────────────────────── */

console.log('\n── 1. Villa ──────────────────────────────────────────')
{
  const { data: existing } = await supabase.from('villa').select('id').maybeSingle()

  const payload = {
    name: mockVilla.name,
    tagline: mockVilla.tagline,
    description: mockVilla.description,
    bedrooms: mockVilla.specs.bedrooms,
    bathrooms: mockVilla.specs.bathrooms,
    max_guests: mockVilla.specs.maxGuests,
    size_sqm: mockVilla.specs.sizeSqm,
    size_sqft: mockVilla.specs.sizeSqft,
    has_pool: mockVilla.specs.hasPool,
    has_jacuzzi: mockVilla.specs.hasJacuzzi,
    has_ac: mockVilla.specs.hasAC,
    has_wifi: mockVilla.specs.hasWifi,
    has_parking: mockVilla.specs.hasParking,
    amenities: mockVilla.amenities,
    address: mockVilla.location?.address ?? null,
    city: mockVilla.location?.city ?? 'Tahiti',
    country: mockVilla.location?.country ?? 'French Polynesia',
    latitude: mockVilla.location?.lat ?? null,
    longitude: mockVilla.location?.lng ?? null,
    hero_video_url: mockVilla.heroVideoUrl ?? null,
    hero_image_url: url(mockVilla.heroImage),
    hero_image_alt: alt(mockVilla.heroImage),
    seo_title: mockVilla.seo?.metaTitle ?? null,
    seo_description: mockVilla.seo?.metaDescription ?? null,
    og_image_url: url(mockVilla.seo?.ogImage),
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase.from('villa').update(payload).eq('id', existing.id)
    if (error) throw error
    console.log(`✓ Updated existing villa (${existing.id})`)
  } else {
    const { data, error } = await supabase.from('villa').insert(payload).select('id').single()
    if (error) throw error
    console.log(`✓ Inserted new villa (${data.id})`)
  }
}

/* ─── 2. Gallery items ────────────────────────────────────────────────────── */

console.log('\n── 2. Gallery items ──────────────────────────────────')
{
  await supabase.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = (mockVilla.gallery ?? []).map((g, i) => ({
    image_url: url(g) ?? '',
    alt: alt(g) ?? mockVilla.name,
    caption: (g as { caption?: string }).caption ?? null,
    category: (g as { category?: string }).category ?? 'exterior',
    sort_order: i * 10,
    active: true,
  }))
  if (rows.length > 0) {
    const { error, count } = await supabase.from('gallery_items').insert(rows, { count: 'exact' })
    if (error) throw error
    console.log(`✓ Inserted ${count ?? rows.length} gallery items`)
  }
}

/* ─── 3. Experiences ──────────────────────────────────────────────────────── */

console.log('\n── 3. Experiences ────────────────────────────────────')
{
  await supabase.from('experiences').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = mockExperiences.map((e, i) => ({
    slug: e.slug.current,
    title: e.title,
    category: e.category,
    short_description: e.shortDescription,
    description: e.description ?? null,
    cover_image_url: url(e.coverImage),
    cover_image_alt: alt(e.coverImage),
    price_usd: e.priceUSD,
    price_unit: e.priceUnit ?? 'per_person',
    min_guests: e.minGuests ?? null,
    max_guests: e.maxGuests ?? null,
    duration: e.duration ?? null,
    meeting_point: e.meetingPoint ?? null,
    seasonal: e.seasonal ?? false,
    season_start: e.seasonStart ?? null,
    season_end: e.seasonEnd ?? null,
    provider_id: null, // Sanity mock has no provider FK — operator can wire later in admin
    highlights: e.highlights ?? [],
    popularity: e.popularity ?? 50,
    featured: e.featured ?? false,
    active: e.active ?? true,
    sort_order: i * 10,
    seo_title: e.seo?.metaTitle ?? null,
    seo_description: e.seo?.metaDescription ?? null,
  }))
  if (rows.length > 0) {
    const { error, count } = await supabase.from('experiences').insert(rows, { count: 'exact' })
    if (error) throw error
    console.log(`✓ Inserted ${count ?? rows.length} experiences`)
  }
}

/* ─── 4. Reviews ──────────────────────────────────────────────────────────── */

console.log('\n── 4. Reviews ────────────────────────────────────────')
{
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = mockReviews.map((r) => ({
    author_name: r.authorName,
    author_location: r.authorLocation ?? null,
    author_photo_url: null,
    rating: r.rating,
    title: r.title,
    body: r.body,
    stay_from: r.stayDates?.from ?? null,
    stay_to: r.stayDates?.to ?? null,
    verified: r.verified ?? true,
    source: r.source ?? 'direct',
    featured: r.featured ?? false,
    published_at: r.publishedAt,
  }))
  if (rows.length > 0) {
    const { error, count } = await supabase.from('reviews').insert(rows, { count: 'exact' })
    if (error) throw error
    console.log(`✓ Inserted ${count ?? rows.length} reviews`)
  }
}

/* ─── 5. Posts (blog) ─────────────────────────────────────────────────────── */

console.log('\n── 5. Blog posts ─────────────────────────────────────')
{
  await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = mockPosts.map((p) => ({
    slug: p.slug.current,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body ?? null,
    cover_image_url: url(p.coverImage),
    cover_image_alt: alt(p.coverImage),
    author_name: p.author?.name ?? null,
    author_photo_url: null,
    author_bio: p.author?.bio ?? null,
    tags: p.tags ?? [],
    reading_time_min: p.readingTimeMin ?? null,
    published_at: p.publishedAt ?? null,
    seo_title: p.seo?.metaTitle ?? null,
    seo_description: p.seo?.metaDescription ?? null,
    og_image_url: url(p.seo?.ogImage),
  }))
  if (rows.length > 0) {
    const { error, count } = await supabase.from('posts').insert(rows, { count: 'exact' })
    if (error) throw error
    console.log(`✓ Inserted ${count ?? rows.length} posts`)
  }
}

/* ─── 6. FAQs ─────────────────────────────────────────────────────────────── */

console.log('\n── 6. FAQs ───────────────────────────────────────────')
{
  await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = mockFaqs.map((f) => ({
    question: f.question,
    answer: f.answer,
    category: f.category,
    sort_order: f.order ?? 0,
    active: true,
  }))
  if (rows.length > 0) {
    const { error, count } = await supabase.from('faqs').insert(rows, { count: 'exact' })
    if (error) throw error
    console.log(`✓ Inserted ${count ?? rows.length} FAQs`)
  }
}

/* ─── 7. Settings singleton ───────────────────────────────────────────────── */

console.log('\n── 7. Settings ───────────────────────────────────────')
{
  const { data: existing } = await supabase.from('settings').select('id').maybeSingle()

  const s = mockSettings as unknown as Record<string, unknown>
  const payload = {
    site_name: (s.siteName as string) ?? 'Villa Paradise Tahiti',
    site_description: (s.siteDescription as string) ?? null,
    contact_email: (s.contactEmail as string) ?? null,
    contact_phone: (s.contactPhone as string) ?? null,
    whatsapp_number: (s.whatsappNumber as string) ?? null,
    social_instagram: (s.socialInstagram as string) ?? null,
    social_facebook: (s.socialFacebook as string) ?? null,
    social_pinterest: (s.socialPinterest as string) ?? null,
    social_tiktok: (s.socialTiktok as string) ?? null,
    default_min_nights: (s.defaultMinNights as number) ?? 5,
    default_deposit_percent: (s.defaultDepositPercent as number) ?? 30,
    default_nightly_rate_usd: (s.defaultNightlyRateUSD as number) ?? null,
    cleaning_fee_usd: (s.cleaningFeeUSD as number) ?? null,
    rate_low_usd: (s.rateLowUSD as number) ?? null,
    rate_high_usd: (s.rateHighUSD as number) ?? null,
    rate_peak_usd: (s.ratePeakUSD as number) ?? null,
    season_windows: (s.seasonWindows as unknown[]) ?? [],
    cancellation_policy: (s.cancellationPolicy as string) ?? null,
    terms_of_service: (s.termsOfService as string) ?? null,
    privacy_policy: (s.privacyPolicy as string) ?? null,
    booking_terms_url: (s.bookingTermsUrl as string) ?? null,
    response_time_hours: (s.responseTimeHours as number) ?? null,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase.from('settings').update(payload).eq('id', existing.id)
    if (error) throw error
    console.log(`✓ Updated existing settings (${existing.id})`)
  } else {
    const { data, error } = await supabase.from('settings').insert(payload).select('id').single()
    if (error) throw error
    console.log(`✓ Inserted new settings (${data.id})`)
  }
}

console.log('\n✓ Done. Open /admin/content/* to see the seeded data.\n')

}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err)
  process.exit(1)
})
