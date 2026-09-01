import type { Metadata } from 'next'

import { getSiteContentEntries } from '@/lib/content'
import { CONTACT_CONTENT_DEFAULTS, CONTACT_CONTENT_GROUPS } from '@/lib/content/contact'

import { SiteContentForm } from '../site/SiteContentForm'

export const metadata: Metadata = { title: 'Textes de la page Contact — Admin' }

// Always read fresh so freshly-saved values appear (avoids the Data Cache).
export const dynamic = 'force-dynamic'

export default async function ContactContentPage() {
  const values = await getSiteContentEntries()

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">
        Textes de la page Contact.
      </h1>
      <p className="mt-2 max-w-2xl font-sans text-sm text-midnight-400">
        Toute la page : accroche, libellés du formulaire, message de confirmation, bloc
        coordonnées et chiffres clés. Laisse un champ vide pour garder le texte par défaut.
      </p>
      <p className="mt-2 max-w-2xl font-sans text-sm text-midnight-400">
        L’adresse email et le numéro de téléphone affichés ne sont pas ici : ils viennent de
        Réglages, pour qu’une coordonnée ne se modifie qu’à un seul endroit.
      </p>

      <div className="mt-8 max-w-5xl">
        <SiteContentForm
          groups={CONTACT_CONTENT_GROUPS}
          values={values}
          defaults={CONTACT_CONTENT_DEFAULTS}
        />
      </div>
    </div>
  )
}
