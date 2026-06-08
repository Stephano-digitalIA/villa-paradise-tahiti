/**
 * Import the curated static gallery (lib/data/gallery-images.ts) into the
 * Supabase `gallery_items` table so the /gallery page (now DB-driven) stays
 * rich AND every image becomes editable from /admin/content/gallery.
 *
 * Idempotent: skips any image whose image_url already exists. Safe to re-run.
 *
 * Run (PowerShell):
 *   npx tsx --env-file=.env.local scripts/import-gallery-from-static.ts
 */

import { createClient } from '@supabase/supabase-js'

import { galleryImages } from '../lib/data/gallery-images'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: existing, error: readErr } = await supabase
    .from('gallery_items')
    .select('image_url, sort_order')
  if (readErr) throw readErr

  const existingUrls = new Set((existing ?? []).map((r) => r.image_url))
  const maxSort = (existing ?? []).reduce((m, r) => Math.max(m, r.sort_order ?? 0), 0)

  const toInsert = galleryImages
    .filter((img) => !existingUrls.has(img.url))
    .map((img, i) => ({
      image_url: img.url,
      alt: img.alt,
      caption: img.caption ?? null,
      category: img.category,
      width: img.width,
      height: img.height,
      sort_order: maxSort + (i + 1) * 10,
      active: true,
    }))

  console.log(`Static images: ${galleryImages.length}`)
  console.log(`Already in DB: ${existingUrls.size}`)
  console.log(`To insert    : ${toInsert.length}`)

  if (toInsert.length === 0) {
    console.log('Nothing to import — DB already has every static image.')
    return
  }

  const { error, count } = await supabase
    .from('gallery_items')
    .insert(toInsert, { count: 'exact' })
  if (error) throw error

  console.log(`✓ Imported ${count ?? toInsert.length} gallery items — editable at /admin/content/gallery`)
}

main().catch((err) => {
  console.error('\n✗ Import failed:', err)
  process.exit(1)
})
