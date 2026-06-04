/**
 * Seed `excursion_providers` with 7 plausible Tahiti partners, then
 * wire each existing experience to its provider via `provider_id`.
 *
 * Why: the Sanity mock leaves the provider field empty on every
 * experience, so the `excursion_providers` table stays empty after the
 * main seed. This script gives Thierry a realistic starting set that
 * matches the experience descriptions (marine biologist guide,
 * catamaran from Marina Taina, etc.) — he can then edit / add / remove
 * partners from /admin/content/providers.
 *
 * Idempotent: skips providers already in the DB (matched by name),
 * keeps existing experience.provider_id values that are non-null.
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/seed-providers.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface ProviderSeed {
  name: string
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  instagram: string | null
  commission_percent: number | null
  notes: string
  services: string[]
  active: boolean
  /** Slugs of experiences this provider services — used to wire `provider_id`. */
  serves: string[]
}

const PROVIDERS: ProviderSeed[] = [
  {
    name: 'Tahiti Lagoon Explorers',
    contact_email: 'contact@tahiti-lagoon-explorers.pf',
    contact_phone: '+689 87 12 34 56',
    website: null,
    instagram: '@tahitilagoonexplorers',
    commission_percent: 12.5,
    notes: 'Eco-certified snorkel & whale-watching operator out of Punaauia and Papeete. Marine biologist guides.',
    services: ['Lagoon snorkeling', 'Whale watching (seasonal)', 'Reef ecology talks'],
    active: true,
    serves: ['lagoon-snorkeling-tour', 'whale-watching'],
  },
  {
    name: 'Tahiti Off-Road Adventures',
    contact_email: 'bookings@tahiti-offroad.pf',
    contact_phone: '+689 87 23 45 67',
    website: null,
    instagram: '@tahitioffroad',
    commission_percent: 10,
    notes: 'Full-day 4x4 island tours into the Papenoo valley. English-speaking driver-guide, lunch included.',
    services: ['4x4 island tours', 'Waterfall hikes', 'Highland picnics'],
    active: true,
    serves: ['4x4-island-discovery'],
  },
  {
    name: 'Taina Sunset Sails',
    contact_email: 'hello@taina-sunset.pf',
    contact_phone: '+689 87 34 56 78',
    website: null,
    instagram: '@tainasunsetsails',
    commission_percent: 15,
    notes: '40-foot catamaran based at Marina Taina. Sunset cruises with champagne; optional onboard photographer.',
    services: ['Sunset sailing', 'Private charters', 'Onboard photography'],
    active: true,
    serves: ['sunset-sailing-cruise'],
  },
  {
    name: 'Vahine Private Chef',
    contact_email: 'vahine.chef@gmail.com',
    contact_phone: '+689 87 45 67 89',
    website: null,
    instagram: '@vahine.chef',
    commission_percent: 8,
    notes: 'Polynesian-French fusion chef. Cooks at the villa or on the lagoon pontoon. Wine pairing on request.',
    services: ['Private dinners', 'Polynesian BBQ', 'Cooking demonstrations'],
    active: true,
    serves: ['private-lagoon-dinner', 'polynesian-bbq'],
  },
  {
    name: 'Hina Astronomy Tahiti',
    contact_email: 'hina@hina-astro.pf',
    contact_phone: '+689 87 56 78 90',
    website: null,
    instagram: '@hinaastrotahiti',
    commission_percent: 10,
    notes: 'Local astronomer with portable telescope. Specialises in Polynesian celestial navigation storytelling.',
    services: ['Stargazing nights', 'Celestial navigation talks'],
    active: true,
    serves: ['stargazing-astronomy'],
  },
  {
    name: 'Heiva Cultural Tours',
    contact_email: 'tours@heiva-culture.pf',
    contact_phone: '+689 87 67 89 01',
    website: null,
    instagram: '@heivaculturaltours',
    commission_percent: 12,
    notes: 'Half-day visits to living Polynesian villages — tapa, dance, ahimaa lunch. English-speaking guide.',
    services: ['Cultural village visits', 'Artisan workshops', 'Traditional meal experiences'],
    active: true,
    serves: ['cultural-village-visit'],
  },
  {
    name: 'Monoï Spa Tahiti',
    contact_email: 'spa@monoi-tahiti.pf',
    contact_phone: '+689 87 78 90 12',
    website: null,
    instagram: '@monoispatahiti',
    commission_percent: 15,
    notes: 'Certified taurumi therapists. In-villa massage with Tahitian monoï oil; couples option.',
    services: ['Taurumi massage', 'Couples massage', 'Body scrubs'],
    active: true,
    serves: ['in-villa-spa-massage'],
  },
]

async function main() {

/* ─── 1. Insert providers (skip duplicates by name) ───────────────────────── */

console.log('\n── 1. Insert providers ──────────────────────────────')

const insertedIdByName = new Map<string, string>()

for (const p of PROVIDERS) {
  const { data: existing } = await supabase
    .from('excursion_providers')
    .select('id')
    .eq('name', p.name)
    .maybeSingle()

  if (existing) {
    console.log(`  ⏭  ${p.name} — already exists (${existing.id})`)
    insertedIdByName.set(p.name, existing.id)
    continue
  }

  const { data, error } = await supabase
    .from('excursion_providers')
    .insert({
      name: p.name,
      contact_email: p.contact_email,
      contact_phone: p.contact_phone,
      website: p.website,
      instagram: p.instagram,
      commission_percent: p.commission_percent,
      notes: p.notes,
      services: p.services,
      active: p.active,
    })
    .select('id')
    .single()
  if (error) throw error
  console.log(`  ✓  ${p.name} (${data.id})`)
  insertedIdByName.set(p.name, data.id)
}

/* ─── 2. Wire experiences to providers ────────────────────────────────────── */

console.log('\n── 2. Link experiences ──────────────────────────────')

let wired = 0
let skipped = 0
for (const p of PROVIDERS) {
  const providerId = insertedIdByName.get(p.name)
  if (!providerId) continue
  for (const slug of p.serves) {
    const { data: exp } = await supabase
      .from('experiences')
      .select('id, provider_id, title')
      .eq('slug', slug)
      .maybeSingle()
    if (!exp) {
      console.warn(`  ⚠  No experience found for slug "${slug}"`)
      continue
    }
    if (exp.provider_id) {
      console.log(`  ⏭  ${exp.title} — already wired`)
      skipped++
      continue
    }
    const { error } = await supabase
      .from('experiences')
      .update({ provider_id: providerId })
      .eq('id', exp.id)
    if (error) throw error
    console.log(`  ✓  ${exp.title} → ${p.name}`)
    wired++
  }
}

console.log(`\n✓ Done. ${insertedIdByName.size} providers in DB, ${wired} experiences wired (${skipped} already linked).`)
console.log('  Open /admin/content/providers to review and edit.\n')

}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err)
  process.exit(1)
})
