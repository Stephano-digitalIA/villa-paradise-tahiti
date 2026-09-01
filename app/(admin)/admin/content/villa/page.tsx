import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { VillaForm } from './VillaForm'
import type { Villa } from '@/lib/supabase/types'
import { getSiteContentEntries } from '@/lib/content'
import { VILLA_CONTENT_DEFAULTS, VILLA_CONTENT_GROUPS } from '@/lib/content/villa'
import { SiteContentForm } from '../site/SiteContentForm'

export const metadata: Metadata = { title: 'Paramètres villa — Admin' }
export const dynamic = 'force-dynamic'

export default async function VillaEditPage() {
  // Defensive limit(1): tolerate any stray duplicate row (maybeSingle alone
  // errors on >1 rows and would fall back to the placeholder default).
  const { data } = await adminClient
    .from('villa')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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

  const contentValues = await getSiteContentEntries()

  return (
    <>
      <VillaForm villa={villa} />

      {/*
        Second, independent editor. The form above writes the `villa` table
        (name, capacity, address, SEO); this one writes `site_content` for the
        page copy that has no column of its own. Two forms, two save buttons,
        on purpose: they persist to different places.
      */}
      <div className="border-t border-pearl-400 p-8">
        <h2 className="font-heading text-2xl font-semibold text-midnight">
          Textes de la page Villa
        </h2>
        <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
          Le bloc « Le cadre » de la page Villa : la carte, le paragraphe de présentation du
          quartier et les quatre distances. Laisse un champ vide pour garder le texte par
          défaut. Vider le lieu d’une distance retire la ligne de la page.
        </p>

        <div className="mt-8 max-w-5xl">
          <SiteContentForm
            groups={VILLA_CONTENT_GROUPS}
            values={contentValues}
            defaults={VILLA_CONTENT_DEFAULTS}
          />
        </div>
      </div>
    </>
  )
}
