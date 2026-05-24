'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import type { ExperienceCategory, PriceUnit } from '@/lib/supabase/types'

const REVALIDATE = () => {
  revalidatePath('/admin/content/experiences')
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

function parseExperience(formData: FormData) {
  const highlightsRaw = formData.get('highlights') as string
  const highlights = highlightsRaw
    ? highlightsRaw.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  const seasonal = formData.get('seasonal') === 'true'

  return {
    title: (formData.get('title') as string).trim(),
    slug:
      ((formData.get('slug') as string) || '').trim() ||
      slugify((formData.get('title') as string).trim()),
    category: formData.get('category') as ExperienceCategory,
    short_description: (formData.get('short_description') as string).trim(),
    description: (formData.get('description') as string | null) || null,
    price_usd: Number(formData.get('price_usd') ?? 0),
    price_unit: formData.get('price_unit') as PriceUnit,
    min_guests: formData.get('min_guests') ? Number(formData.get('min_guests')) : null,
    max_guests: formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
    duration: (formData.get('duration') as string | null) || null,
    meeting_point: (formData.get('meeting_point') as string | null) || null,
    seasonal,
    season_start: seasonal ? (formData.get('season_start') as string | null) || null : null,
    season_end: seasonal ? (formData.get('season_end') as string | null) || null : null,
    provider_id: (formData.get('provider_id') as string | null) || null,
    highlights,
    popularity: Number(formData.get('popularity') ?? 0),
    featured: formData.get('featured') === 'true',
    active: formData.get('active') === 'true',
    cover_image_url: (formData.get('cover_image_url') as string | null) || null,
    cover_image_alt: (formData.get('cover_image_alt') as string | null) || null,
    seo_title: (formData.get('seo_title') as string | null) || null,
    seo_description: (formData.get('seo_description') as string | null) || null,
  }
}

export async function createExperience(formData: FormData): Promise<void> {
  const payload = { ...parseExperience(formData), sort_order: 0 }
  const { error } = await adminClient.from('experiences').insert(payload)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function updateExperience(id: string, formData: FormData): Promise<void> {
  const payload = { ...parseExperience(formData), updated_at: new Date().toISOString() }
  const { error } = await adminClient.from('experiences').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}

export async function toggleExperienceField(
  id: string,
  field: 'active' | 'featured',
  value: boolean,
): Promise<void> {
  // Build a typed partial to satisfy the strict Supabase types
  const patch: { active?: boolean; featured?: boolean; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }
  if (field === 'active') patch.active = value
  else patch.featured = value

  const { error } = await adminClient
    .from('experiences')
    .update(patch)
    .eq('id', id)
  if (error) throw new Error(error.message)
  REVALIDATE()
}
