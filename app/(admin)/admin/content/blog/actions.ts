'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

const REVALIDATE = () => {
  revalidatePath('/admin/content/blog')
  revalidatePath('/', 'layout')
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parsePost(formData: FormData) {
  const tagsRaw = (formData.get('tags') as string | null) || ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const publishedAtRaw = (formData.get('published_at') as string | null) || ''

  return {
    title: (formData.get('title') as string).trim(),
    slug:
      ((formData.get('slug') as string) || '').trim() ||
      slugify((formData.get('title') as string).trim()),
    excerpt: (formData.get('excerpt') as string).trim(),
    body: (formData.get('body') as string | null) || null,
    cover_image_url: (formData.get('cover_image_url') as string | null) || null,
    cover_image_alt: (formData.get('cover_image_alt') as string | null) || null,
    author_name: (formData.get('author_name') as string | null) || null,
    author_bio: (formData.get('author_bio') as string | null) || null,
    tags,
    reading_time_min: formData.get('reading_time_min')
      ? Number(formData.get('reading_time_min'))
      : null,
    published_at: publishedAtRaw ? new Date(publishedAtRaw).toISOString() : null,
    seo_title: (formData.get('seo_title') as string | null) || null,
    seo_description: (formData.get('seo_description') as string | null) || null,
  }
}

export async function createPost(formData: FormData): Promise<void> {
  const payload = parsePost(formData)
  const { error } = await adminClient.from('posts').insert(payload)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function updatePost(id: string, formData: FormData): Promise<void> {
  const payload = { ...parsePost(formData), updated_at: new Date().toISOString() }
  const { error } = await adminClient.from('posts').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
