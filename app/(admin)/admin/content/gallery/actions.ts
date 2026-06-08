'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import { uploadFile } from '@/lib/supabase/storage'
import type { GalleryCategory } from '@/lib/supabase/types'

const REVALIDATE = () => {
  // Admin list + every public surface that shows gallery photos.
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
// deleteGalleryItem — DELETE row + remove from Storage
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteGalleryItem(id: string, imageUrl: string): Promise<void> {
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
