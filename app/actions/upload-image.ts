'use server'

import { uploadFile } from '@/lib/supabase/storage'

const ALLOWED_BUCKETS = new Set([
  'villa-media',
  'experiences-media',
  'blog-media',
  'reviews-media',
])

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

/**
 * Generic admin image upload — used by <ImageUploadField />.
 * Uploads to a Supabase Storage bucket and returns the public URL.
 */
export async function uploadImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string | null)?.trim() ?? ''
  const prefix = (formData.get('prefix') as string | null)?.trim() || 'uploads'

  if (!file || file.size === 0) return { error: 'No file selected' }
  if (!ALLOWED_BUCKETS.has(bucket)) return { error: `Unknown bucket "${bucket}"` }
  if (file.size > MAX_BYTES) return { error: 'Image too large (8 MB max)' }

  const ext = (file.name.split('.').pop() || 'jpg')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const safePrefix = prefix.replace(/[^a-z0-9/_-]/gi, '-').replace(/^\/+|\/+$/g, '')
  const path = `${safePrefix}/${Date.now()}.${ext || 'jpg'}`

  return uploadFile(bucket, path, file, {
    contentType: file.type || undefined,
    upsert: true,
  })
}
