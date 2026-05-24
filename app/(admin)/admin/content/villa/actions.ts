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
    updated_at: new Date().toISOString(),
  }

  const { error } = await adminClient.from('villa').upsert(payload)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/content/villa')
  revalidatePath('/', 'layout')
}
