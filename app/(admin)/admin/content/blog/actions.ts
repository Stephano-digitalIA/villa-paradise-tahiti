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

function parseTranslations(formData: FormData): Record<string, string> {
  const fr = (k: string) => ((formData.get(k) as string | null) ?? '').trim()
  return {
    title: fr('title__fr'),
    excerpt: fr('excerpt__fr'),
    body: fr('body__fr'),
    cover_image_alt: fr('cover_image_alt__fr'),
    author_bio: fr('author_bio__fr'),
    seo_title: fr('seo_title__fr'),
    seo_description: fr('seo_description__fr'),
  }
}

function parsePost(formData: FormData) {
  const tagsRaw = (formData.get('tags') as string | null) || ''
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  // Publish status: toggle ON → published_at is the chosen date (or now if the
  // date is empty); toggle OFF → null (draft, hidden from the public blog).
  const published = formData.get('published') === 'true'
  const publishedAtRaw = (formData.get('published_at') as string | null) || ''
  const published_at = published
    ? publishedAtRaw
      ? new Date(publishedAtRaw).toISOString()
      : new Date().toISOString()
    : null

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
    published_at,
    seo_title: (formData.get('seo_title') as string | null) || null,
    seo_description: (formData.get('seo_description') as string | null) || null,
  }
}

export async function createPost(formData: FormData): Promise<void> {
  const payload = { ...parsePost(formData), translations: parseTranslations(formData) }
  const { error } = await adminClient.from('posts').insert(payload)
  if (error) {
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = payload
    void _omit
    const { error: retry } = await adminClient.from('posts').insert(enOnly)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}

export async function updatePost(id: string, formData: FormData): Promise<void> {
  const payload = {
    ...parsePost(formData),
    translations: parseTranslations(formData),
    updated_at: new Date().toISOString(),
  }
  const { error } = await adminClient.from('posts').update(payload).eq('id', id)
  if (error) {
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = payload
    void _omit
    const { error: retry } = await adminClient.from('posts').update(enOnly).eq('id', id)
    if (retry) throw new Error(retry.message)
  }
  REVALIDATE()
}
