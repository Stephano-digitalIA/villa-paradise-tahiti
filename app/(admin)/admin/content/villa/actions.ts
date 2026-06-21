'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// updateVilla — upsert the single villa row
// ─────────────────────────────────────────────────────────────────────────────

export async function updateVilla(formData: FormData): Promise<void> {
  const amenitiesRaw = formData.get('amenities') as string
  const amenities = amenitiesRaw
    ? amenitiesRaw.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  // French source per translatable field — stored in the `translations` jsonb.
  const fr = (key: string) => ((formData.get(key) as string | null) ?? '').trim()
  const translations: Record<string, string> = {
    name: fr('name__fr'),
    tagline: fr('tagline__fr'),
    description: fr('description__fr'),
    hero_image_alt: fr('hero_image_alt__fr'),
    amenities: fr('amenities__fr'),
    seo_title: fr('seo_title__fr'),
    seo_description: fr('seo_description__fr'),
  }

  const payload = {
    name: (formData.get('name') as string).trim(),
    tagline: (formData.get('tagline') as string | null) || null,
    description: (formData.get('description') as string | null) || null,
    hero_image_url: (formData.get('hero_image_url') as string | null) || null,
    hero_image_alt: (formData.get('hero_image_alt') as string | null) || null,
    hero_video_url: (formData.get('hero_video_url') as string | null) || null,
    bedrooms: Number(formData.get('bedrooms') ?? 1),
    bathrooms: Number(formData.get('bathrooms') ?? 1),
    max_guests: Number(formData.get('max_guests') ?? 2),
    size_sqm: formData.get('size_sqm') ? Number(formData.get('size_sqm')) : null,
    size_sqft: formData.get('size_sqft') ? Number(formData.get('size_sqft')) : null,
    has_pool: formData.get('has_pool') === 'true',
    has_jacuzzi: formData.get('has_jacuzzi') === 'true',
    has_ac: formData.get('has_ac') === 'true',
    has_wifi: formData.get('has_wifi') === 'true',
    has_parking: formData.get('has_parking') === 'true',
    amenities,
    address: (formData.get('address') as string | null) || null,
    city: (formData.get('city') as string).trim(),
    country: (formData.get('country') as string).trim(),
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    seo_title: (formData.get('seo_title') as string | null) || null,
    seo_description: (formData.get('seo_description') as string | null) || null,
    translations,
    updated_at: new Date().toISOString(),
  }

  const { error } = await adminClient.from('villa').upsert(payload)

  if (error) {
    // Before migration 011 the `translations` column doesn't exist yet — retry
    // without it so the form keeps working until the SQL is applied.
    if (!/translations/.test(error.message)) throw new Error(error.message)
    const { translations: _omit, ...enOnly } = payload
    void _omit
    const { error: retryError } = await adminClient.from('villa').upsert(enOnly)
    if (retryError) throw new Error(retryError.message)
  }

  revalidatePath('/admin/content/villa')
  revalidatePath('/villa')
  revalidatePath('/', 'layout')
}
