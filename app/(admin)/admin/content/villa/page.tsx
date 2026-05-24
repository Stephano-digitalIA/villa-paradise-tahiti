import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { VillaForm } from './VillaForm'
import type { Villa } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Villa Settings — Admin' }
export const dynamic = 'force-dynamic'

export default async function VillaEditPage() {
  const { data } = await adminClient.from('villa').select('*').maybeSingle()

  // Provide a safe default so the form always renders
  const villa: Villa = data ?? {
    id: '',
    name: 'Villa Paradise Tahiti',
    tagline: null,
    description: null,
    bedrooms: 3,
    bathrooms: 3,
    max_guests: 6,
    size_sqm: null,
    size_sqft: null,
    has_pool: false,
    has_jacuzzi: false,
    has_ac: false,
    has_wifi: true,
    has_parking: false,
    amenities: [],
    address: null,
    city: 'Bora Bora',
    country: 'French Polynesia',
    latitude: null,
    longitude: null,
    hero_video_url: null,
    hero_image_url: null,
    hero_image_alt: null,
    seo_title: null,
    seo_description: null,
    og_image_url: null,
    updated_at: new Date().toISOString(),
  }

  return <VillaForm villa={villa} />
}
