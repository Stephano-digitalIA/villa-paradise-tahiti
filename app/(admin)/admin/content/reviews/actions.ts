'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { adminClient, PUBLIC_CONTENT_TAG } from '@/lib/supabase/admin'
import type { ReviewRating, ReviewSource } from '@/lib/supabase/types'

const REVALIDATE = () => {
  // Drop the cached public read first. Revalidating a path only re-renders
// it, and the re-render would be served the same cached Supabase response.
  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/admin/content/reviews')
  // Drop the cached public read first. Revalidating a path only re-renders
// it, and the re-render would be served the same cached Supabase response.
  revalidateTag(PUBLIC_CONTENT_TAG)
  revalidatePath('/', 'layout')
}

function parseTranslations(formData: FormData): Record<string, string> {
  const fr = (k: string) => ((formData.get(k) as string | null) ?? '').trim()
  return {
    author_location: fr('author_location__fr'),
    title: fr('title__fr'),
    body: fr('body__fr'),
  }
}

function parseReview(formData: FormData) {
  return {
    author_name: (formData.get('author_name') as string).trim(),
    author_location: (formData.get('author_location') as string | null) || null,
    rating: Number(formData.get('rating') ?? 5) as ReviewRating,
    title: (formData.get('title') as string).trim(),
    body: (formData.get('body') as string).trim(),
    stay_from: (formData.get('stay_from') as string | null) || null,
    stay_to: (formData.get('stay_to') as string | null) || null,
    verified: formData.get('verified') === 'true',
    source: (formData.get('source') as ReviewSource) || 'direct',
    featured: formData.get('featured') === 'true',
    published_at:
      (formData.get('published_at') as string | null) || new Date().toISOString(),
  }
}

export async function createReview(formData: FormData): Promise<void> {
  const payload = { ...parseReview(formData), translations: parseTranslations(formData) }
  const { error } = await adminClient.from('reviews').insert(payload)
  if (error) {
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = payload
    void _omit
    const { error: retry } = await adminClient.from('reviews').insert(enOnly)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

export async function updateReview(id: string, formData: FormData): Promise<void> {
  const payload = { ...parseReview(formData), translations: parseTranslations(formData) }
  const { error } = await adminClient.from('reviews').update(payload).eq('id', id)
  if (error) {
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = payload
    void _omit
    const { error: retry } = await adminClient.from('reviews').update(enOnly).eq('id', id)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

export async function toggleReviewFeatured(id: string, value: boolean): Promise<void> {
  const { error } = await adminClient
    .from('reviews')
    .update({ featured: value })
    .eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
