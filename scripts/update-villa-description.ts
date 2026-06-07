/**
 * Update ONLY the villa.description column in Supabase from mock-data.ts.
 *
 * Safe & surgical: touches a single column of the villa singleton.
 * Does NOT delete or re-insert any other table (unlike seed-from-mock.ts).
 *
 * Run (PowerShell):
 *   npx tsx --env-file=.env.local scripts/update-villa-description.ts
 */

import { createClient } from '@supabase/supabase-js'

import { mockVilla } from '../lib/sanity/mock-data'

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
  const { data: existing, error: findErr } = await supabase
    .from('villa')
    .select('id, description')
    .maybeSingle()
  if (findErr) throw findErr
  if (!existing) {
    console.error('✗ No villa row found — nothing to update.')
    process.exit(1)
  }

  console.log('Old description (first 60 chars):', String(existing.description).slice(0, 60), '…')

  const { error } = await supabase
    .from('villa')
    .update({
      description: mockVilla.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
  if (error) throw error

  console.log('✓ Updated villa.description')
  console.log('New description (first 60 chars):', String(mockVilla.description).slice(0, 60), '…')
}

main().catch((err) => {
  console.error('\n✗ Update failed:', err)
  process.exit(1)
})
