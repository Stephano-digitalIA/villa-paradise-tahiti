'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import type { ReviewRating, ReviewSource } from '@/lib/supabase/types'

const REVALIDATE = () => {
  revalidatePath('/admin/content/reviews')
  revalidatePath('/', 'layout')
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
  const payload = parseReview(formData)
  const { error } = await adminClient.from('reviews').insert(payload)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function updateReview(id: string, formData: FormData): Promise<void> {
  const payload = parseReview(formData)
  const { error } = await adminClient.from('reviews').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
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
