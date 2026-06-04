/**
 * Set an admin user's password directly via the Supabase service role.
 *
 * Bypasses the default 3-email-per-hour rate limit on `resetPasswordForEmail`,
 * useful when an admin is locked out and the password-reset email channel
 * is throttled.
 *
 * Usage (PowerShell):
 *   node --env-file=.env.local scripts/set-admin-password.mjs <email> <newPassword>
 *
 * Example:
 *   node --env-file=.env.local scripts/set-admin-password.mjs thierrytahiti@hotmail.com "MyNewSecret#2026"
 *
 * After running:
 *   1. The user can sign in immediately at /admin/auth with email + new password.
 *   2. Clear PowerShell history so the password doesn't linger:
 *        Clear-History
 */

import { createClient } from '@supabase/supabase-js'

const email = (process.argv[2] || '').trim().toLowerCase()
const newPassword = process.argv[3] || ''

if (!email || !newPassword) {
  console.error('Usage: node --env-file=.env.local scripts/set-admin-password.mjs <email> <newPassword>')
  process.exit(1)
}

if (newPassword.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY in env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log(`\n── 1. Locate user by email ──────────────────────────`)
const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
})
if (listErr) {
  console.error(`List users failed: ${listErr.message}`)
  process.exit(1)
}
const user = list.users.find((u) => (u.email || '').toLowerCase() === email)
if (!user) {
  console.error(`No user found with email: ${email}`)
  console.error(`Known users: ${list.users.map((u) => u.email).filter(Boolean).join(', ')}`)
  process.exit(1)
}
console.log(`Found: ${user.email} (id=${user.id})`)

console.log(`\n── 2. Verify admin_users whitelist ───────────────────`)
const { data: adminRow } = await supabase
  .from('admin_users')
  .select('id, role, full_name')
  .eq('id', user.id)
  .maybeSingle()

if (!adminRow) {
  console.warn(`⚠  ${email} is NOT in admin_users — they can authenticate but won't pass the admin gate.`)
} else {
  console.log(`✓ admin_users: role=${adminRow.role}, name=${adminRow.full_name ?? '—'}`)
}

console.log(`\n── 3. Update password ────────────────────────────────`)
console.log(`Password length: ${newPassword.length} chars`)
console.log(`First/last char: '${newPassword.charAt(0)}' / '${newPassword.charAt(newPassword.length - 1)}'`)
const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
  password: newPassword,
  email_confirm: true, // ensure email is confirmed in case it wasn't
})
if (updateErr) {
  console.error(`Update failed: ${updateErr.message}`)
  process.exit(1)
}
console.log(`✓ updateUserById succeeded`)

console.log(`\n── 4. Verify by attempting a real signIn ─────────────`)
// Use the anon-key client (same as the browser does) to make sure the
// password truly works end-to-end, not just at the admin-API level.
const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
  email,
  password: newPassword,
})
if (signInErr) {
  console.error(`\n✗ Verification FAILED: ${signInErr.message}`)
  console.error(`  The password was updated in Supabase but signIn rejects it.`)
  console.error(`  Possible causes:`)
  console.error(`    - The string you passed contains a PowerShell-interpolated character`)
  console.error(`      (e.g. unescaped \$) that's different from what you'll type in the form`)
  console.error(`    - Email is banned, deleted, or has no Email identity (only Google OAuth)`)
  process.exit(1)
}
console.log(`✓ signInWithPassword succeeded — session id: ${signInData.session?.access_token?.slice(0, 20) ?? '?'}…`)
console.log(`\n✓ Done. ${email} can sign in at /admin/auth with EXACTLY this password:`)
console.log(`  >>> ${newPassword}`)
console.log(`\n  (Copy the line above and paste in the form — copy-paste avoids typos.)`)
console.log(`  Don't forget: Clear-History  in PowerShell to remove the password from shell history.`)
