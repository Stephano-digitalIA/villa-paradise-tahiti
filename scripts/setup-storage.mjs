/**
 * setup-storage.mjs
 * Creates the 5 Supabase Storage buckets for Villa Paradise Tahiti.
 * Run once after the Supabase project is configured:
 *   npm run setup:storage
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import pkg from '@next/env'
const { loadEnvConfig } = pkg
import { createClient } from '@supabase/supabase-js'

const { combinedEnv } = loadEnvConfig(process.cwd())

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = combinedEnv

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌  Missing env vars. Make sure .env.local contains:\n' +
    '   NEXT_PUBLIC_SUPABASE_URL\n' +
    '   SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BUCKETS = [
  {
    name: 'villa-media',
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'],
  },
  {
    name: 'experiences-media',
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  {
    name: 'blog-media',
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  {
    name: 'reviews-media',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'uploads',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
]

console.log(`\n🪣  Creating Supabase Storage buckets on ${NEXT_PUBLIC_SUPABASE_URL}\n`)

let success = 0
let skipped = 0
let failed = 0

for (const bucket of BUCKETS) {
  const { error } = await supabase.storage.createBucket(bucket.name, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: bucket.allowedMimeTypes,
  })

  if (!error) {
    console.log(`✅  ${bucket.name} — created (${bucket.public ? 'public' : 'private'})`)
    success++
  } else if (error.message.toLowerCase().includes('already exists') || error.message.toLowerCase().includes('duplicate')) {
    console.log(`⏭️   ${bucket.name} — already exists, skipped`)
    skipped++
  } else {
    console.error(`❌  ${bucket.name} — ${error.message}`)
    failed++
  }
}

console.log(`\n📊  Done: ${success} created, ${skipped} skipped, ${failed} failed\n`)

if (failed > 0) process.exit(1)
