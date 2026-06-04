/**
 * Upload hero video to Supabase Storage — villa-media bucket.
 * Usage: node scripts/upload-hero-video.mjs <path-to-file> [destination-filename]
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, statSync } from 'fs'
import { resolve, basename } from 'path'
// Run with: node --env-file=.env.local scripts/upload-hero-video.mjs <file> [dest]

const BUCKET = 'villa-media'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const localPath = resolve(process.argv[2] ?? '')
const destName  = process.argv[3] ?? basename(localPath)

if (!localPath) {
  console.error('Usage: node scripts/upload-hero-video.mjs <path-to-file> [dest-name]')
  process.exit(1)
}

const fileSizeMB = (statSync(localPath).size / 1_048_576).toFixed(1)
console.log(`Uploading: ${localPath}`)
console.log(`Size     : ${fileSizeMB} Mo`)
console.log(`Dest     : ${BUCKET}/${destName}`)
console.log('Please wait…')

const supabase = createClient(supabaseUrl, supabaseKey)
const fileBuffer = readFileSync(localPath)

const { data, error } = await supabase.storage
  .from(BUCKET)
  .upload(destName, fileBuffer, {
    contentType: 'video/mp4',
    upsert: true,
  })

if (error) {
  console.error('Upload failed:', error.message)
  process.exit(1)
}

const { data: { publicUrl } } = supabase.storage
  .from(BUCKET)
  .getPublicUrl(destName)

console.log('\n✓ Upload successful!')
console.log('Public URL:', publicUrl)
