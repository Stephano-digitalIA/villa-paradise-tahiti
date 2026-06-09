import type { Metadata } from 'next'

import { getSiteContentEntries } from '@/lib/content'
import { SITE_CONTENT_GROUPS } from '@/lib/content/registry'

import { SiteContentForm } from './SiteContentForm'

export const metadata: Metadata = { title: 'Textes du site — Admin' }

// Always read fresh so freshly-saved values appear (avoids the Data Cache).
export const dynamic = 'force-dynamic'

export default async function SiteContentPage() {
  const values = await getSiteContentEntries()

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">Textes du site</h1>
      <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
        Personnalise les textes marketing de la page d’accueil. Laisse un champ vide pour
        garder le texte par défaut. Les changements apparaissent immédiatement sur le site.
      </p>

      <div className="mt-8 max-w-5xl">
        <SiteContentForm groups={SITE_CONTENT_GROUPS} values={values} />
      </div>
    </div>
  )
}
