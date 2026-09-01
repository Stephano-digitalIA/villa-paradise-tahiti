import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contenu — Admin' }

/**
 * Ordered to match `mainNav` in `lib/navigation.ts`, so the operator finds a
 * page here in the same order they see it in the site header. Two entries have
 * no header equivalent and are placed by what they belong to: Accueil first
 * (the header logo links there), Prestataires straight after Prestations,
 * which it feeds.
 *
 * Two header pages have no editor yet: « Comment venir » and « Contact ».
 * Their copy is still hardcoded, in `app/(marketing)/getting-here/page.tsx`
 * (one 339-line page, no section components) and in
 * `components/sections/contact/*`.
 */
const SECTIONS = [
  {
    href: '/admin/content/site',
    title: 'Accueil',
    description: 'Modifier les textes marketing de la page d’accueil (titres, accroches, boutons)',
  },
  {
    href: '/admin/content/villa',
    title: 'Villa',
    description: 'Modifier nom, description, caractéristiques, équipements, localisation et SEO',
  },
  {
    href: '/admin/content/experiences',
    title: 'Prestations',
    description: 'Gérer excursions, restauration, bien-être et activités culturelles',
  },
  {
    href: '/admin/content/providers',
    title: 'Prestataires',
    description: 'Gérer les partenaires excursions et activités',
  },
  {
    href: '/admin/content/gallery',
    title: 'Galerie',
    description: 'Téléverser, réordonner et catégoriser les photos de la villa',
  },
  {
    href: '/admin/content/rates',
    title: 'Tarifs',
    description:
      'Modifier les textes de la page Tarifs (saisons, inclus, options, annulation). Les montants se règlent dans Réglages',
  },
  {
    href: '/admin/content/reviews',
    title: 'Avis',
    description: 'Ajouter et gérer les avis clients de toutes les sources',
  },
  {
    href: '/admin/content/blog',
    title: 'Blog',
    description: 'Rédiger et publier des articles sur Tahiti et la vie à la villa',
  },
  {
    href: '/admin/content/faq',
    title: 'FAQ',
    description: 'Éditer les questions fréquentes en ligne, groupées par catégorie',
  },
]

export default function ContentPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">Contenu</h1>
      <p className="mt-1 font-sans text-sm text-midnight-400">
        Gérer l&apos;ensemble du contenu public de Villa Paradise Tahiti, dans l&apos;ordre du
        menu du site
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
          >
            <h2 className="font-heading text-base font-semibold text-midnight transition-colors group-hover:text-gold">
              {s.title}
            </h2>
            <p className="mt-1 font-sans text-sm text-midnight-400">{s.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-3xl font-sans text-xs text-midnight-400">
        Deux pages du menu n&apos;ont pas encore d&apos;éditeur : « Comment venir » et
        « Contact ». Leurs textes sont pour l&apos;instant modifiables uniquement dans le code.
      </p>
    </div>
  )
}
