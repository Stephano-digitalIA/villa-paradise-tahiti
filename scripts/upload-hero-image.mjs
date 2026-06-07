/**
 * Upload the villa hero image to Supabase Storage (villa-media bucket) and
 * point villa.hero_image_url at its public URL — so the operator can swap it
 * later from /admin/content/villa.
 *
 * Usage (PowerShell):
 *   node --env-file=.env.local scripts/upload-hero-image.mjs "components/sections/villa/hero pool villa lighter.png"
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, statSync } from 'fs'
import { resolve, basename, extname } from 'path'

const BUCKET = 'villa-media'
const DEST_NAME = 'hero-pool-villa-lighter.png'
const ALT_TEXT = 'Villa Paradise Tahiti — infinity pool overlooking the lagoon'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const localPath = resolve(process.argv[2] ?? '')
if (!process.argv[2]) {
  console.error('Usage: node --env-file=.env.local scripts/upload-hero-image.mjs <path-to-image>')
  process.exit(1)
}

const ext = extname(localPath).toLowerCase()
const contentType =
  ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'

const fileSizeMB = (statSync(localPath).size / 1_048_576).toFixed(1)
console.log(`Uploading: ${basename(localPath)} (${fileSizeMB} Mo, ${contentType})`)
console.log(`Dest     : ${BUCKET}/${DEST_NAME}`)

const supabase = createClient(supabaseUrl, supabaseKey)
const fileBuffer = readFileSync(localPath)

const { error: uploadErr } = await supabase.storage
  .from(BUCKET)
  .upload(DEST_NAME, fileBuffer, { contentType, upsert: true })
if (uploadErr) {
  console.error('Upload failed:', uploadErr.message)
  process.exit(1)
}

const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(DEST_NAME)
console.log('✓ Uploaded. Public URL:', publicUrl)

// Point the villa singleton at the new hero image
const { data: villa, error: findErr } = await supabase
  .from('villa')
  .select('id')
  .maybeSingle()
if (findErr) {
  console.error('Lookup failed:', findErr.message)
  process.exit(1)
}
if (!villa) {
  console.error('No villa row found — uploaded file but did not update DB.')
  process.exit(1)
}

const { error: updErr } = await supabase
  .from('villa')
  .update({
    hero_image_url: publicUrl,
    hero_image_alt: ALT_TEXT,
    updated_at: new Date().toISOString(),
  })
  .eq('id', villa.id)
if (updErr) {
  console.error('DB update failed:', updErr.message)
  process.exit(1)
}

console.log('✓ villa.hero_image_url updated — editable from /admin/content/villa')
