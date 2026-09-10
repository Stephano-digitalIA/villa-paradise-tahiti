/**
 * Remove the auth accounts a bot created through the sign-in form.
 *
 * A ghost account is one that matches ALL of:
 *   - created during the attack window,
 *   - email never confirmed,
 *   - never signed in,
 *   - email absent from `customers` and from `admin_users`.
 *
 * The last rule is the safety net. A real guest who reached the checkout has
 * a `customers` row, and an administrator is in `admin_users`; neither can be
 * swept up here even if their account happens to be unconfirmed.
 *
 * Dry run (default, deletes nothing):
 *   npx tsx --env-file=.env.local scripts/purge-ghost-accounts.ts
 * Apply:
 *   npx tsx --env-file=.env.local scripts/purge-ghost-accounts.ts --apply
 */
import { createClient } from '@supabase/supabase-js'

/** First day the bot was seen. Anything older is left alone. */
const ATTACK_FROM = '2026-09-08T00:00:00Z'

const mask = (email: string) => email.replace(/^(.{2}).*(@.*)$/, '$1***$2')

async function main() {
  const apply = process.argv.includes('--apply')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, key)

  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error

  const [{ data: customers }, { data: admins }] = await Promise.all([
    db.from('customers').select('email'),
    db.from('admin_users').select('email'),
  ])
  const protectedEmails = new Set(
    [...(customers ?? []), ...(admins ?? [])]
      .map((r) => String((r as { email: string }).email).toLowerCase())
      .filter(Boolean),
  )

  const since = new Date(ATTACK_FROM).getTime()
  const ghosts = data.users.filter((u) => {
    const email = (u.email ?? '').toLowerCase()
    return (
      new Date(u.created_at).getTime() >= since &&
      !u.email_confirmed_at &&
      !u.last_sign_in_at &&
      email !== '' &&
      !protectedEmails.has(email)
    )
  })
  const spared = data.users.filter(
    (u) =>
      new Date(u.created_at).getTime() >= since &&
      !ghosts.includes(u),
  )

  console.log(apply ? '=== APPLICATION ===' : '=== ESSAI A BLANC (aucune suppression) ===')
  console.log('comptes au total                 :', data.users.length)
  console.log('crees depuis le', ATTACK_FROM.slice(0, 10), '   :', ghosts.length + spared.length)
  console.log('  fantomes, a supprimer          :', ghosts.length)
  console.log('  epargnes (confirmes, connectes :', spared.length)
  console.log('   ou connus des tables clients)')
  console.log('')
  console.log('Epargnes dans la fenetre, pour controle :')
  for (const u of spared) {
    const why = u.email_confirmed_at
      ? 'confirme'
      : u.last_sign_in_at
        ? 'connecte'
        : 'present dans clients/admins'
    console.log('   ', mask(u.email ?? '?').padEnd(30), why)
  }

  if (!apply) {
    console.log('')
    console.log('Rien supprime. Relancer avec --apply pour appliquer.')
    return
  }

  let done = 0
  let failed = 0
  for (const u of ghosts) {
    const { error: delErr } = await db.auth.admin.deleteUser(u.id)
    if (delErr) {
      failed += 1
      console.log('   ECHEC', mask(u.email ?? '?'), delErr.message)
    } else {
      done += 1
    }
  }

  const { data: after } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
  console.log('')
  console.log('APRES :')
  console.log('  supprimes        :', done)
  console.log('  echecs           :', failed)
  console.log('  comptes restants :', after?.users.length ?? '?')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
