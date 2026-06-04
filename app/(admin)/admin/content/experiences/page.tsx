import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExperienceToggle } from './ExperienceToggles'
import type { Experience, ExcursionProvider } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Prestations — Admin' }

const CATEGORY_LABEL: Record<string, string> = {
  excursion: 'Excursion',
  evening: 'Soirée',
  dining: 'Restauration',
  wellness: 'Bien-être',
  cultural: 'Culturel',
  adventure: 'Aventure',
}

const PRICE_UNIT_LABEL: Record<string, string> = {
  per_person: 'par personne',
  per_group: 'par groupe',
  flat: 'forfait',
}
export const dynamic = 'force-dynamic'

type ExperienceWithProvider = Experience & {
  excursion_providers: Pick<ExcursionProvider, 'name'> | null
}

const CATEGORY_VARIANT: Record<
  string,
  'default' | 'info' | 'success' | 'warning' | 'luxe' | 'gold'
> = {
  excursion: 'info',
  evening: 'luxe',
  dining: 'gold',
  wellness: 'success',
  cultural: 'warning',
  adventure: 'warning',
}

export default async function ExperiencesPage() {
  const { data } = await adminClient
    .from('experiences')
    .select('*, excursion_providers(name)')
    .order('sort_order', { ascending: true })

  const experiences = (data ?? []) as ExperienceWithProvider[]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Prestations</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">{experiences.length} prestation{experiences.length > 1 ? 's' : ''}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/content/experiences/new">+ Ajouter une prestation</Link>
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">Aucune prestation pour le moment.</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">Clique sur + pour créer la première.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pearl-400 bg-pearl-300/40">
                  {['Slug', 'Titre', 'Catégorie', 'Prix', 'Unité', 'Actif', 'Mis en avant', 'Prestataire', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className={idx < experiences.length - 1 ? 'border-b border-pearl-400' : ''}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-midnight-400">{exp.slug}</td>
                    <td className="px-5 py-4 font-sans text-sm font-medium text-midnight">
                      {exp.title}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={CATEGORY_VARIANT[exp.category] ?? 'default'} size="sm">
                        {CATEGORY_LABEL[exp.category] ?? exp.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-midnight">
                      ${exp.price_usd}
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-midnight-400">
                      {PRICE_UNIT_LABEL[exp.price_unit] ?? exp.price_unit}
                    </td>
                    <td className="px-5 py-4">
                      <ExperienceToggle id={exp.id} field="active" value={exp.active} />
                    </td>
                    <td className="px-5 py-4">
                      <ExperienceToggle id={exp.id} field="featured" value={exp.featured} />
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-midnight-400">
                      {exp.excursion_providers?.name ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/content/experiences/${exp.id}`}
                        className="font-sans text-xs font-medium text-gold hover:underline"
                      >
                        Éditer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
