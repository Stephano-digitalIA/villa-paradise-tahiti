/**
 * Assign each bedroom photo to the room it shows.
 *
 * Read off the descriptions the operator wrote, not guessed. Two rooms are
 * currently photographed:
 *
 *   Bedroom 1: the master bedroom, four photos (the room, its desk, its
 *              bathroom, the bathtub with the ocean view).
 *   Bedroom 2: the "chambre vallée", two photos (the room and its shower
 *              room).
 *
 * One photo is deliberately left unassigned. Its only description is
 * "chambres", which says it is a bedroom and nothing more. Putting it in a
 * room would be a guess, and a wrong guess is worse than an honest gap: the
 * gallery already has a "More bedrooms" section for exactly this, and the
 * admin has a dropdown to fix it in one click.
 *
 * Matched on the file name rather than sort order, which drag and drop can
 * change at any time.
 *
 * Dry run (default, writes nothing):
 *   npx tsx --env-file=.env.local scripts/assign-gallery-rooms.ts
 * Apply:
 *   npx tsx --env-file=.env.local scripts/assign-gallery-rooms.ts --apply
 */
import { createClient } from '@supabase/supabase-js'

/** File name to room number. */
const ASSIGNMENT: Record<string, number> = {
  'bedroom-master.jpg': 1,
  '1788232405077-qhyl96xro1n.JPG': 1,
  '1788232706339-onmi39p56ze.JPG': 1,
  'interior-bedroom-desk.webp': 1,
  '1788232970844-yuar3403wrn.png': 2,
  '1788233137210-snn0oltncop.JPG': 2,
}

interface Row {
  id: string
  alt: string | null
  image_url: string
  room_number: number | null
  category: string
  deleted_at?: string | null
}

const fileOf = (url: string) => String(url).split('/').pop() ?? ''

async function main() {
  const apply = process.argv.includes('--apply')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars.')
  const db = createClient(url, key)

  const { data, error } = await db
    .from('gallery_items')
    .select('id, alt, image_url, room_number, category, deleted_at')
    .eq('category', 'bedrooms')
    .eq('active', true)
  if (error) throw error

  const rows = (data ?? []).filter((r) => !(r as Row).deleted_at) as Row[]

  const planned = rows
    .map((r) => ({ row: r, room: ASSIGNMENT[fileOf(r.image_url)] }))
    .filter((p) => p.room !== undefined)
  const skipped = rows.filter((r) => ASSIGNMENT[fileOf(r.image_url)] === undefined)
  // A file in the map that no longer exists means the map is stale.
  const orphans = Object.keys(ASSIGNMENT).filter(
    (f) => !rows.some((r) => fileOf(r.image_url) === f),
  )

  console.log(apply ? '=== APPLICATION ===' : '=== ESSAI A BLANC (aucune ecriture) ===')
  console.log('photos de chambres :', rows.length)
  console.log('  a attribuer      :', planned.length)
  console.log('  laissees libres  :', skipped.length)
  if (orphans.length) console.log('  ATTENTION, fichiers introuvables :', orphans.join(', '))
  console.log('')

  for (const n of [1, 2, 3, 4, 5]) {
    const inRoom = planned.filter((p) => p.room === n)
    if (inRoom.length === 0) continue
    console.log('  Chambre ' + n + ' (' + inRoom.length + ') :')
    for (const p of inRoom) console.log('     ', JSON.stringify(p.row.alt))
  }
  if (skipped.length) {
    console.log('')
    console.log('  Sans chambre, a preciser dans l admin :')
    for (const r of skipped) console.log('     ', JSON.stringify(r.alt), '|', fileOf(r.image_url))
  }

  if (!apply) {
    console.log('')
    console.log('Rien ecrit. Relancer avec --apply pour appliquer.')
    return
  }

  for (const p of planned) {
    const { error: upErr } = await db
      .from('gallery_items')
      .update({ room_number: p.room })
      .eq('id', p.row.id)
    if (upErr) throw upErr
  }

  const { data: after } = await db
    .from('gallery_items')
    .select('id, alt, image_url, room_number, deleted_at')
    .eq('category', 'bedrooms')
    .eq('active', true)
  const back = (after ?? []).filter((r) => !(r as Row).deleted_at) as Row[]

  console.log('')
  console.log('APRES :')
  for (const n of [1, 2, 3, 4, 5]) {
    const c = back.filter((r) => r.room_number === n).length
    if (c) console.log('  Chambre ' + n + ' :', c, 'photo(s)')
  }
  console.log('  Sans chambre :', back.filter((r) => r.room_number == null).length)
  const wrong = back.filter((r) => {
    const want = ASSIGNMENT[fileOf(r.image_url)]
    return want !== undefined && r.room_number !== want
  })
  console.log('  Attributions non appliquees :', wrong.length, '(doit etre 0)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
