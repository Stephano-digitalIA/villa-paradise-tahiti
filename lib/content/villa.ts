/**
 * Editable copy for the /villa page.
 *
 * Same mechanism as the homepage and rates registries: the component keeps its
 * English text as the `t(key, fallback)` fallback, the operator overrides any
 * key from /admin/content/villa, and all three share the `site_content` table.
 *
 * Scope note: the villa's own fields (name, description, bedrooms, address,
 * SEO) live in the `villa` Supabase table and are edited by `VillaForm` on the
 * same admin page. Only the surrounding page copy, which has no column of its
 * own, belongs here.
 *
 * The type import below is erased at compile time, so this file and
 * `registry.ts` referencing each other creates no runtime cycle.
 */
import type { ContentGroup } from './registry'

export const VILLA_CONTENT_GROUPS: ContentGroup[] = [
  {
    title: 'Villa : le cadre (bloc carte et distances)',
    fields: [
      { key: 'villa.location.eyebrow', label: 'Sur-titre' },
      { key: 'villa.location.title', label: 'Titre de section', multiline: true },
      { key: 'villa.location.intro', label: 'Paragraphe', multiline: true, rows: 4 },
      { key: 'villa.location.maps_cta', label: 'Bouton sur la carte' },
      { key: 'villa.location.d1.value', label: 'Distance 1, durée (en gras)' },
      { key: 'villa.location.d1.label', label: 'Distance 1, lieu' },
      { key: 'villa.location.d2.value', label: 'Distance 2, durée (en gras)' },
      { key: 'villa.location.d2.label', label: 'Distance 2, lieu' },
      { key: 'villa.location.d3.value', label: 'Distance 3, durée (en gras)' },
      { key: 'villa.location.d3.label', label: 'Distance 3, lieu' },
      { key: 'villa.location.d4.value', label: 'Distance 4, durée (en gras)' },
      { key: 'villa.location.d4.label', label: 'Distance 4, lieu' },
    ],
  },
]

/**
 * Published English text per key. MUST mirror the `t(key, 'fallback')`
 * fallbacks in `components/sections/villa/Location.tsx`, which is what the
 * public page shows when no override exists.
 */
export const VILLA_CONTENT_DEFAULTS: Readonly<Record<string, string>> = {
  'villa.location.eyebrow': 'The Setting',
  'villa.location.title': 'On this quiet stretch of coastline, travelers come for...',
  'villa.location.intro':
    "Punaauia, Tahiti's most prestigious neighbourhood: a postcard shoreline with white sandy beaches and a turquoise lagoon, twenty-five minutes from the airport and a world away from the hustle of the capital.",
  'villa.location.maps_cta': 'View on Google Maps',
  'villa.location.d1.value': '25 min by car',
  'villa.location.d1.label': 'Faaa International Airport (PPT)',
  'villa.location.d2.value': '30 min by car',
  'villa.location.d2.label': 'Papeete city center',
  'villa.location.d3.value': 'Steps from the villa',
  'villa.location.d3.label': 'Lagoon access',
  'villa.location.d4.value': '5 min by car',
  'villa.location.d4.label': 'Restaurants, shops & shopping centre',
}
