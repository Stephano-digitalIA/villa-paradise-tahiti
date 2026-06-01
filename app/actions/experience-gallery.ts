'use server'

import { revalidatePath } from 'next/cache'

import { adminClient } from '@/lib/supabase/admin'
import { deleteFile, uploadFile } from '@/lib/supabase/storage'

type Result = { ok: true } | { ok: false; error: string }

const BUCKET = 'experiences-media'
const GALLERY_PATH_PREFIX = 'gallery/'

function revalidate(experienceId: string, experienceSlug?: string | null) {
  revalidatePath(`/admin/content/experiences/${experienceId}`)
  if (experienceSlug) {
    revalidatePath(`/experiences/${experienceSlug}`)
  }
  revalidatePath('/experiences')
}

/* ───────────────────────────────────────────────────────────────
 * Add — accepts either an uploaded file OR a pasted URL
 * ─────────────────────────────────────────────────────────────── */

export async function addGalleryImage(formData: FormData): Promise<Result> {
  const experienceId = (formData.get('experience_id') as string | null)?.trim()
  const experienceSlug = (formData.get('experience_slug') as string | null)?.trim()
  const alt = (formData.get('alt') as string | null)?.trim() || null
  const file = formData.get('file') as File | null
  const url = (formData.get('url') as string | null)?.trim() || null

  if (!experienceId) return { ok: false, error: 'Missing experience id' }
  if ((!file || file.size === 0) && !url) {
    return { ok: false, error: 'Provide either a file to upload or an image URL' }
  }

  // Next sort_order = max existing + 1 (so new images land at the bottom)
  const { data: lastRow } = await adminClient
    .from('experience_gallery')
    .select('sort_order')
    .eq('experience_id', experienceId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextSortOrder = (lastRow?.sort_order ?? 0) + 1

  let imageUrl: string
  if (file && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      return { ok: false, error: 'Image too large (8 MB max)' }
    }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const safeSlug = (experienceSlug ?? experienceId).replace(/[^a-z0-9-]/gi, '-')
    const storagePath = `${GALLERY_PATH_PREFIX}${safeSlug}-${Date.now()}.${ext || 'jpg'}`
    const uploadResult = await uploadFile(BUCKET, storagePath, file, {
      contentType: file.type || undefined,
      upsert: true,
    })
    if ('error' in uploadResult) return { ok: false, error: uploadResult.error }
    imageUrl = uploadResult.url
  } else {
    imageUrl = url as string
  }

  const { error } = await adminClient.from('experience_gallery').insert({
    experience_id: experienceId,
    image_url: imageUrl,
    alt,
    sort_order: nextSortOrder,
  })
  if (error) return { ok: false, error: error.message }

  revalidate(experienceId, experienceSlug)
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Update alt text
 * ─────────────────────────────────────────────────────────────── */

export async function updateGalleryImageAlt(
  imageId: string,
  alt: string,
  experienceId: string,
  experienceSlug: string | null,
): Promise<Result> {
  const { error } = await adminClient
    .from('experience_gallery')
    .update({ alt: alt.trim() || null })
    .eq('id', imageId)
  if (error) return { ok: false, error: error.message }
  revalidate(experienceId, experienceSlug)
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Reorder — swap sort_order with adjacent neighbor
 * ─────────────────────────────────────────────────────────────── */

export async function reorderGalleryImage(
  imageId: string,
  direction: 'up' | 'down',
  experienceId: string,
  experienceSlug: string | null,
): Promise<Result> {
  const { data: current, error: cErr } = await adminClient
    .from('experience_gallery')
    .select('id, sort_order, experience_id')
    .eq('id', imageId)
    .maybeSingle()
  if (cErr) return { ok: false, error: cErr.message }
  if (!current) return { ok: false, error: 'Image not found' }

  const baseQuery = adminClient
    .from('experience_gallery')
    .select('id, sort_order')
    .eq('experience_id', current.experience_id)

  const neighborQuery =
    direction === 'up'
      ? baseQuery
          .lt('sort_order', current.sort_order)
          .order('sort_order', { ascending: false })
      : baseQuery
          .gt('sort_order', current.sort_order)
          .order('sort_order', { ascending: true })

  const { data: neighbor } = await neighborQuery.limit(1).maybeSingle()
  if (!neighbor) return { ok: false, error: 'Already at the boundary' }

  // PostgREST has no atomic swap — do it in 3 steps via a sentinel value so
  // we don't violate any future unique constraint on (experience_id, sort_order).
  const sentinel = -Math.abs(current.sort_order + 100000)
  await adminClient
    .from('experience_gallery')
    .update({ sort_order: sentinel })
    .eq('id', current.id)
  await adminClient
    .from('experience_gallery')
    .update({ sort_order: current.sort_order })
    .eq('id', neighbor.id)
  await adminClient
    .from('experience_gallery')
    .update({ sort_order: neighbor.sort_order })
    .eq('id', current.id)

  revalidate(experienceId, experienceSlug)
  return { ok: true }
}

/* ───────────────────────────────────────────────────────────────
 * Delete — removes DB row + storage file (if hosted by us)
 * ─────────────────────────────────────────────────────────────── */

export async function deleteGalleryImage(
  imageId: string,
  experienceId: string,
  experienceSlug: string | null,
): Promise<Result> {
  const { data: image, error: fetchErr } = await adminClient
    .from('experience_gallery')
    .select('image_url')
    .eq('id', imageId)
    .maybeSingle()
  if (fetchErr) return { ok: false, error: fetchErr.message }

  // Try to clean up the storage file if it lives in our bucket.
  if (image?.image_url) {
    const marker = `/${BUCKET}/`
    const idx = image.image_url.indexOf(marker)
    if (idx >= 0) {
      const storagePath = image.image_url.slice(idx + marker.length)
      // Strip any query/fragment that might have crept in (signed URL token, etc.)
      const cleanPath = storagePath.split(/[?#]/)[0]
      await deleteFile(BUCKET, cleanPath)
    }
  }

  const { error } = await adminClient
    .from('experience_gallery')
    .delete()
    .eq('id', imageId)
  if (error) return { ok: false, error: error.message }

  revalidate(experienceId, experienceSlug)
  return { ok: true }
}
