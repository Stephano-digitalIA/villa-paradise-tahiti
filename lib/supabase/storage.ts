import { createClient } from './client'

// ─────────────────────────────────────────────────────────────────────────────
// Bucket names — must match the buckets created in Supabase Storage
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET_VILLA = 'villa-media'
const BUCKET_EXPERIENCES = 'experiences-media'
const BUCKET_BLOG = 'blog-media'
const BUCKET_REVIEWS = 'reviews-media'

// ─────────────────────────────────────────────────────────────────────────────
// Public URL helper (browser-safe, no auth required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the public CDN URL for a file stored in a Supabase Storage bucket.
 * The bucket must have public access enabled in the Supabase dashboard.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload / Delete (server-side only — uses adminClient to bypass RLS)
// ─────────────────────────────────────────────────────────────────────────────

type UploadResult = { url: string } | { error: string }

/**
 * Uploads a file to a Supabase Storage bucket using the service-role client.
 * ONLY call this from server-side code (Route Handlers, Server Actions).
 *
 * @param bucket  - Target bucket name
 * @param path    - Storage path within the bucket (e.g. "gallery/hero.jpg")
 * @param file    - File or Blob to upload
 * @param options - contentType and upsert flag (default: upsert = true)
 * @returns       - { url } on success or { error } on failure
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean },
): Promise<UploadResult> {
  // Dynamic import keeps adminClient out of the browser bundle
  const { adminClient } = await import('./admin')

  const { error } = await adminClient.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType,
    upsert: options?.upsert ?? true,
  })

  if (error) {
    console.error('[uploadFile]', error.message)
    return { error: error.message }
  }

  const url = getPublicUrl(bucket, path)
  return { url }
}

/**
 * Removes a file from a Supabase Storage bucket.
 * ONLY call this from server-side code.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { adminClient } = await import('./admin')
  const { error } = await adminClient.storage.from(bucket).remove([path])
  if (error) {
    console.error('[deleteFile]', error.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Path helpers — map semantic names to bucket + path pairs
// ─────────────────────────────────────────────────────────────────────────────

export type StorageRef = { bucket: string; path: string }

export const storage = {
  // Villa media
  villaHero: (filename: string): StorageRef => ({
    bucket: BUCKET_VILLA,
    path: `hero/${filename}`,
  }),
  villaGallery: (filename: string): StorageRef => ({
    bucket: BUCKET_VILLA,
    path: `gallery/${filename}`,
  }),
  villaVideo: (filename: string): StorageRef => ({
    bucket: BUCKET_VILLA,
    path: `video/${filename}`,
  }),

  // Experiences media
  experienceCover: (slug: string, ext = 'jpg'): StorageRef => ({
    bucket: BUCKET_EXPERIENCES,
    path: `covers/${slug}.${ext}`,
  }),
  experienceGallery: (slug: string, index: number, ext = 'jpg'): StorageRef => ({
    bucket: BUCKET_EXPERIENCES,
    path: `gallery/${slug}-${index}.${ext}`,
  }),

  // Blog media
  blogCover: (slug: string, ext = 'jpg'): StorageRef => ({
    bucket: BUCKET_BLOG,
    path: `covers/${slug}.${ext}`,
  }),

  // Review avatars
  reviewAvatar: (id: string, ext = 'jpg'): StorageRef => ({
    bucket: BUCKET_REVIEWS,
    path: `avatars/${id}.${ext}`,
  }),
} as const
