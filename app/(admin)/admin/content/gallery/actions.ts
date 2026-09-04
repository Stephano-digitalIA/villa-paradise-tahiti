'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { adminClient, PUBLIC_CONTENT_TAG } from '@/lib/supabase/admin'
import { uploadFile } from '@/lib/supabase/storage'
import type { GalleryCategory } from '@/lib/supabase/types'

const REVALIDATE = () => {
  // Admin list + every public surface that shows gallery photos.
  // Drop the cached read first: revalidating the paths only re-renders them,
  // and the re-render would be served the same cached Supabase response.
  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/admin/content/gallery')
  revalidatePath('/gallery')
  revalidatePath('/villa')
  revalidatePath('/')
}

// ─────────────────────────────────────────────────────────────────────────────
// uploadGalleryImage — upload file to Storage + INSERT gallery_items row
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadGalleryImage(formData: FormData): Promise<void> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) throw new Error('No file provided')

  const category = (formData.get('category') as GalleryCategory) || 'exterior'
  const alt = (formData.get('alt') as string)?.trim() || file.name

  // Sort order = current max + 1
  const { data: maxRow } = await adminClient
    .from('gallery_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? 0) + 1

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const result = await uploadFile('villa-media', `gallery/${filename}`, file, {
    contentType: file.type,
    upsert: false,
  })

  if ('error' in result) throw new Error(result.error)

  const { error } = await adminClient.from('gallery_items').insert({
    image_url: result.url,
    alt,
    category,
    sort_order: sortOrder,
    active: true,
  })

  if (error) throw new Error(error.message)
  REVALIDATE()
}

// ─────────────────────────────────────────────────────────────────────────────
// trashGalleryItem — soft delete: hide from site + main grid, KEEP the file
// ─────────────────────────────────────────────────────────────────────────────
export async function trashGalleryItem(id: string): Promise<void> {
  const { error } = await adminClient
    .from('gallery_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    // Pre-migration 013 — `deleted_at` column absent. Fall back to hiding it
    // (active = false) so nothing is ever destroyed; the file is still kept.
    if (!/deleted_at/.test(error.message)) throw new Error(error.message)
    const { error: retry } = await adminClient
      .from('gallery_items')
      .update({ active: false })
      .eq('id', id)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

// ─────────────────────────────────────────────────────────────────────────────
// restoreGalleryItem — bring a trashed item back
// ─────────────────────────────────────────────────────────────────────────────
export async function restoreGalleryItem(id: string): Promise<void> {
  const { error } = await adminClient
    .from('gallery_items')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteGalleryItemPermanently — DELETE row + remove file from Storage (final)
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteGalleryItemPermanently(
  id: string,
  imageUrl: string,
): Promise<void> {
  const { error } = await adminClient.from('gallery_items').delete().eq('id', id)
  if (error) throw new Error(error.message)

  // Extract storage path from URL
  const url = new URL(imageUrl)
  const pathSegments = url.pathname.split('/object/public/villa-media/')
  if (pathSegments[1]) {
    const { adminClient: admin } = await import('@/lib/supabase/admin')
    await admin.storage.from('villa-media').remove([pathSegments[1]])
  }

  REVALIDATE()
}

// ─────────────────────────────────────────────────────────────────────────────
// updateGalleryOrder — bulk UPDATE sort_order values
// ─────────────────────────────────────────────────────────────────────────────
export async function updateGalleryOrder(
  items: Array<{ id: string; sort_order: number }>,
): Promise<void> {
  await Promise.all(
    items.map(({ id, sort_order }) =>
      adminClient.from('gallery_items').update({ sort_order }).eq('id', id),
    ),
  )
  REVALIDATE()
}

// ─────────────────────────────────────────────────────────────────────────────
// updateGalleryText: edit the two texts attached to a photo
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Both texts were write-once: `alt` could only be typed at upload and `caption`
 * had no field at all, while the public gallery displays the caption. So a
 * description written in the admin never reached the site, and could not even
 * be corrected afterwards.
 *
 * `caption` is what visitors read, under the photo and in the lightbox.
 * `alt` stays the accessibility text, and doubles as the caption's fallback
 * when no caption is set, so no photo is ever left without a description.
 *
 * Both also carry a French source, kept in `translations` like every other
 * content table. English is what the site publishes; the French is the
 * operator's own version, and the field to translate from.
 *
 * `room_number` says which bedroom a photo shows, so the gallery can group
 * them by room.
 */
export interface GalleryTextInput {
  id: string
  alt: string
  caption: string
  /** French source for `alt` and `caption`. Stored in the translations map. */
  altFr: string
  captionFr: string
  /** 1 to 5 for a bedroom photo, null everywhere else. */
  roomNumber: number | null
}

export async function updateGalleryText(items: GalleryTextInput[]): Promise<void> {
  const full = items.map(({ id, alt, caption, altFr, captionFr, roomNumber }) => ({
    id,
    row: {
      alt: alt.trim(),
      caption: caption.trim(),
      room_number: roomNumber,
      translations: { alt: altFr.trim(), caption: captionFr.trim() },
    },
  }))

  const results = await Promise.all(
    full.map(({ id, row }) =>
      adminClient.from('gallery_items').update(row).eq('id', id),
    ),
  )

  // Migration 018 adds `room_number` and `translations`, and this project has
  // no migration runner, so the admin has to keep working before the SQL is
  // applied. On that one error, retry with the columns that have always
  // existed rather than losing the edit entirely. Same defensive shape as the
  // other content actions written ahead of their migration.
  const missingColumn = results.some(
    (r) => r.error && /room_number|translations/.test(r.error.message),
  )
  if (missingColumn) {
    await Promise.all(
      items.map(({ id, alt, caption }) =>
        adminClient
          .from('gallery_items')
          .update({ alt: alt.trim(), caption: caption.trim() })
          .eq('id', id),
      ),
    )
  }

  REVALIDATE()
}
