import type { Metadata } from 'next'

import { getSiteContentEntries } from '@/lib/content'
import {
  GETTING_HERE_CONTENT_DEFAULTS,
  GETTING_HERE_CONTENT_GROUPS,
} from '@/lib/content/getting-here'

import { SiteContentForm } from '../site/SiteContentForm'

export const metadata: Metadata = { title: 'Textes de la page Comment venir — Admin' }

// Always read fresh so freshly-saved values appear (avoids the Data Cache).
export const dynamic = 'force-dynamic'

export default async function GettingHereContentPage() {
  const values = await getSiteContentEntries()

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">
        Textes de la page Comment venir.
      </h1>
      <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
        Toute la page : accroche, recherche de vols, tableau des liaisons aériennes,
        transfert aéroport, à savoir avant de partir et appel à l’action. Laisse un champ
        vide pour garder le texte par défaut. Vider la ville de départ d’un vol retire la
        ligne du tableau, ce qui permet de retirer une liaison qui n’est plus opérée.
      </p>

      <div className="mt-8 max-w-5xl">
        <SiteContentForm
          groups={GETTING_HERE_CONTENT_GROUPS}
          values={values}
          defaults={GETTING_HERE_CONTENT_DEFAULTS}
        />
      </div>
    </div>
  )
}
