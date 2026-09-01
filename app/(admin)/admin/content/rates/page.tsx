import type { Metadata } from 'next'

import { getSiteContentEntries } from '@/lib/content'
import { RATES_CONTENT_DEFAULTS, RATES_CONTENT_GROUPS } from '@/lib/content/rates'

import { SiteContentForm } from '../site/SiteContentForm'

export const metadata: Metadata = { title: 'Textes de la page Tarifs — Admin' }

// Always read fresh so freshly-saved values appear (avoids the Data Cache).
export const dynamic = 'force-dynamic'

export default async function RatesContentPage() {
  const values = await getSiteContentEntries()

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">
        Textes de la page Tarifs.
      </h1>
      <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
        Personnalise les textes de la page Tarifs. Laisse un champ vide pour garder le
        texte par défaut. Les montants eux-mêmes (prix par saison, acompte, nuits
        minimum) se règlent dans Réglages, pas ici.
      </p>

      <div className="mt-8 max-w-5xl">
        <SiteContentForm
          groups={RATES_CONTENT_GROUPS}
          values={values}
          defaults={RATES_CONTENT_DEFAULTS}
        />
      </div>
    </div>
  )
}
