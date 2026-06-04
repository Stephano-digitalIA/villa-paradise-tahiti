/**
 * One-shot script — sync admin_users with the desired final state:
 *   - keep  stahiti.sb@gmail.com           (Google)
 *   - keep  thierryhavelange7@gmail.com    (Email + password)
 *   - drop  jcferranddenievre@gmail.com    (no longer admin)
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local (bypass RLS).
 * Run with:  node --env-file=.env.local scripts/admin-users-cleanup.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function logSection(title) {
  console.log('\n──', title, '──────────────────────────')
}

// ─── 1. Current state ─────────────────────────────────────────
logSection('BEFORE')
{
  const { data, error } = await supabase
    .from('admin_users')
    .select('email, role, full_name, created_at')
    .order('email')
  if (error) {
    console.error('SELECT failed:', error.message)
    process.exit(1)
  }
  console.table(data)
}

// ─── 2. Upsert stahiti.sb ─────────────────────────────────────
logSection('UPSERT stahiti.sb@gmail.com')
{
  const { data, error } = await supabase
    .from('admin_users')
    .upsert(
      {
        id: 'a77abe6f-68a0-43cb-a02e-e6e471677e50',
        email: 'stahiti.sb@gmail.com',
        role: 'owner',
        full_name: 'Stephano BELLEME',
      },
      { onConflict: 'id' },
    )
    .select('email, role')
  if (error) {
    console.error('UPSERT failed:', error.message)
    process.exit(1)
  }
  console.log('OK:', data)
}

// ─── 3. Delete jcferranddenievre ──────────────────────────────
logSection('DELETE jcferranddenievre@gmail.com')
{
  const { data, error } = await supabase
    .from('admin_users')
    .delete()
    .eq('email', 'jcferranddenievre@gmail.com')
    .select('email')
  if (error) {
    console.error('DELETE failed:', error.message)
    process.exit(1)
  }
  console.log('Removed rows:', data?.length ?? 0)
}

// ─── 4. Final state ───────────────────────────────────────────
logSection('AFTER')
{
  const { data, error } = await supabase
    .from('admin_users')
    .select('email, role, full_name')
    .order('email')
  if (error) {
    console.error('SELECT failed:', error.message)
    process.exit(1)
  }
  console.table(data)
}

console.log('\n✓ Done.')
