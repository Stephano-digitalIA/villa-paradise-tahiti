/**
 * Clear English values that merely repeat the in-code default.
 *
 * Until this was fixed in `SiteContentForm`, pressing Save on a page whose
 * French source was filled in wrote the pre-filled English into
 * `site_content.value`, even when nothing had been changed. The page looks
 * identical either way, but the row then overrides the code: correcting a
 * default in `lib/content/*` would no longer reach the site.
 *
 * This clears `value` on exactly those rows, so the key falls back to its
 * default again. It touches nothing else:
 *  - a value that differs from the default is a real edit and is left alone,
 *  - `value_fr` is never modified,
 *  - a row whose French is also empty has nothing left to hold, so it is
 *    deleted, which is the same "revert to default" state.
 *
 * Dry run (default, writes nothing):
 *   npx tsx --env-file=.env.local scripts/unfreeze-site-content.ts
 * Apply:
 *   npx tsx --env-file=.env.local scripts/unfreeze-site-content.ts --apply
 */
import { createClient } from '@supabase/supabase-js'

import { SITE_CONTENT_DEFAULTS } from '../lib/content/registry'
import { RATES_CONTENT_DEFAULTS } from '../lib/content/rates'
import { VILLA_CONTENT_DEFAULTS } from '../lib/content/villa'
import { GETTING_HERE_CONTENT_DEFAULTS } from '../lib/content/getting-here'
import { CONTACT_CONTENT_DEFAULTS } from '../lib/content/contact'

const DEFAULTS: Record<string, string> = {
  ...SITE_CONTENT_DEFAULTS,
  ...RATES_CONTENT_DEFAULTS,
  ...VILLA_CONTENT_DEFAULTS,
  ...GETTING_HERE_CONTENT_DEFAULTS,
  ...CONTACT_CONTENT_DEFAULTS,
}

interface Row {
  key: string
  value: string
  value_fr: string
}

async function main() {
  const apply = process.argv.includes('--apply')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, serviceKey)

  const { data, error } = await db.from('site_content').select('key, value, value_fr')
  if (error) throw error
  const rows = (data ?? []) as Row[]

  const frozen = rows.filter(
    (r) =>
      (r.value ?? '').trim() !== '' &&
      DEFAULTS[r.key] !== undefined &&
      r.value === DEFAULTS[r.key],
  )
  const toClear = frozen.filter((r) => (r.value_fr ?? '').trim() !== '')
  const toDelete = frozen.filter((r) => (r.value_fr ?? '').trim() === '')
  const kept = rows.filter((r) => !frozen.includes(r))

  console.log(apply ? '=== APPLICATION ===' : '=== ESSAI A BLANC (aucune ecriture) ===')
  console.log('lignes au total          :', rows.length)
  console.log('figees sur le defaut     :', frozen.length)
  console.log('  anglais a vider        :', toClear.length, '(le francais est conserve)')
  console.log('  lignes a supprimer     :', toDelete.length, '(plus rien a conserver)')
  console.log('lignes laissees intactes :', kept.length)

  const realEdits = kept.filter((r) => (r.value ?? '').trim() !== '')
  console.log('')
  console.log('Modifications reelles preservees :', realEdits.length)
  for (const r of realEdits) console.log('   ', r.key)

  if (!apply) {
    console.log('')
    console.log('Rien n a ete ecrit. Relancer avec --apply pour appliquer.')
    return
  }

  const now = new Date().toISOString()

  if (toClear.length > 0) {
    // Chunked: one large upsert can exceed the request size limit.
    for (let i = 0; i < toClear.length; i += 100) {
      const chunk = toClear.slice(i, i + 100).map((r) => ({
        key: r.key,
        value: '',
        value_fr: r.value_fr,
        updated_at: now,
      }))
      const { error: upErr } = await db
        .from('site_content')
        .upsert(chunk, { onConflict: 'key' })
      if (upErr) throw upErr
    }
  }

  if (toDelete.length > 0) {
    const { error: delErr } = await db
      .from('site_content')
      .delete()
      .in(
        'key',
        toDelete.map((r) => r.key),
      )
    if (delErr) throw delErr
  }

  // Verify against a fresh read rather than trusting the writes.
  const { data: after, error: afterErr } = await db
    .from('site_content')
    .select('key, value, value_fr')
    .order('key')
  if (afterErr) throw afterErr
  const rowsBack = (after ?? []) as Row[]

  const stillFrozen = rowsBack.filter(
    (r) =>
      (r.value ?? '').trim() !== '' &&
      DEFAULTS[r.key] !== undefined &&
      r.value === DEFAULTS[r.key],
  )
  const lostFr = toClear.filter((r) => {
    const now2 = rowsBack.find((x) => x.key === r.key)
    return !now2 || now2.value_fr !== r.value_fr
  })
  const lostEdits = realEdits.filter((r) => {
    const now2 = rowsBack.find((x) => x.key === r.key)
    return !now2 || now2.value !== r.value
  })

  console.log('')
  console.log('APRES :')
  console.log('  lignes restantes            :', rowsBack.length)
  console.log('  encore figees               :', stillFrozen.length, '(doit etre 0)')
  console.log('  francais perdu au passage   :', lostFr.length, '(doit etre 0)')
  console.log('  modifications reelles bris. :', lostEdits.length, '(doit etre 0)')
  for (const r of stillFrozen) console.log('    ENCORE FIGEE', r.key)
  for (const r of lostFr) console.log('    FRANCAIS PERDU', r.key)
  for (const r of lostEdits) console.log('    EDIT PERDU', r.key)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
