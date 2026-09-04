/**
 * Copy the caption into the alt text where the alt is empty.
 *
 * Two bedroom photos ended up with an empty `alt` after being edited in the
 * admin. Nothing is missing on screen, since the visible text is the caption,
 * but an empty alt attribute tells a screen reader the image is decorative and
 * tells Google nothing at all.
 *
 * Narrow on purpose: it only touches rows whose alt is blank and whose caption
 * is not, so it can never overwrite a description someone wrote.
 *
 * Dry run (default, writes nothing):
 *   npx tsx --env-file=.env.local scripts/backfill-gallery-alt.ts
 * Apply:
 *   npx tsx --env-file=.env.local scripts/backfill-gallery-alt.ts --apply
 */
import { createClient } from '@supabase/supabase-js'

interface Row {
  id: string
  category: string
  alt: string | null
  caption: string | null
  image_url: string
  deleted_at?: string | null
}

async function main() {
  const apply = process.argv.includes('--apply')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, key)

  const { data, error } = await db
    .from('gallery_items')
    .select('id, category, alt, caption, image_url, deleted_at')
  if (error) throw error

  const rows = (data ?? []) as Row[]
  const targets = rows.filter(
    (r) => !r.deleted_at && !(r.alt ?? '').trim() && (r.caption ?? '').trim(),
  )
  // Blank on both sides: nothing to copy from, so the operator has to write one.
  const stuck = rows.filter(
    (r) => !r.deleted_at && !(r.alt ?? '').trim() && !(r.caption ?? '').trim(),
  )

  console.log(apply ? '=== APPLICATION ===' : '=== ESSAI A BLANC (aucune ecriture) ===')
  console.log('photos sans texte alternatif  :', targets.length + stuck.length)
  console.log('  recuperables par la legende :', targets.length)
  console.log('  sans legende non plus       :', stuck.length)
  console.log('')

  for (const r of targets) {
    console.log('  ' + r.category.padEnd(12), String(r.image_url).split('/').pop())
    console.log('     alt deviendra :', JSON.stringify((r.caption ?? '').trim()))
  }
  for (const r of stuck) {
    console.log('  A ECRIRE A LA MAIN :', String(r.image_url).split('/').pop())
  }

  if (!apply) {
    console.log('')
    console.log('Rien ecrit. Relancer avec --apply pour appliquer.')
    return
  }

  for (const r of targets) {
    const { error: upErr } = await db
      .from('gallery_items')
      .update({ alt: (r.caption ?? '').trim() })
      .eq('id', r.id)
      // Re-check the emptiness at write time, so a concurrent edit in the admin
      // cannot be clobbered between the read above and this update.
      .eq('alt', r.alt ?? '')
    if (upErr) throw upErr
  }

  const { data: after } = await db
    .from('gallery_items')
    .select('id, alt, caption, image_url, deleted_at')
  const back = (after ?? []) as Row[]
  const stillEmpty = back.filter((r) => !r.deleted_at && !(r.alt ?? '').trim())

  console.log('')
  console.log('APRES :')
  console.log('  lignes mises a jour        :', targets.length)
  console.log('  encore sans alt            :', stillEmpty.length, '(attendu', stuck.length + ')')
  for (const r of stillEmpty) {
    console.log('    ', String(r.image_url).split('/').pop())
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
