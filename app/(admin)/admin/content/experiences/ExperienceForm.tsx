'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { BilingualField } from '@/components/admin/BilingualField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Experience, ExcursionProvider, ExperienceCategory, PriceUnit } from '@/lib/supabase/types'
import { createExperience, updateExperience } from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// ExperienceForm — shared for new + edit
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: ExperienceCategory[] = [
  'excursion', 'evening', 'dining', 'wellness', 'cultural', 'adventure',
]
const PRICE_UNITS: PriceUnit[] = ['per_person', 'flat', 'per_group']

type Props = {
  experience?: Experience | null
  providers: Pick<ExcursionProvider, 'id' | 'name'>[]
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function ExperienceForm({ experience, providers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState(experience?.slug ?? '')
  const [seasonal, setSeasonal] = useState(experience?.seasonal ?? false)

  const tr = experience?.translations ?? {}

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        if (experience) {
          await updateExperience(experience.id, fd)
        } else {
          await createExperience(fd)
        }
        router.push('/admin/content/experiences')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  const isEdit = Boolean(experience)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">
            {isEdit ? 'Éditer la prestation' : 'Nouvelle prestation'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/content/experiences')}>
            Annuler
          </Button>
          <Button type="submit" form="exp-form" disabled={isPending} size="sm">
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer la prestation'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 font-sans text-sm text-coral">
          {error}
        </div>
      )}

      <form id="exp-form" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="px-8">
            <FormSection title="Informations de base">
              <BilingualField
                label="Titre"
                enName="title"
                frName="title__fr"
                defaultEn={experience?.title ?? ''}
                defaultFr={tr.title ?? ''}
                onEnChange={(v) => {
                  if (!experience) setSlug(slugify(v))
                }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Slug
                  </label>
                  <Input
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-généré depuis le titre"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Catégorie <span className="text-coral">*</span>
                  </label>
                  <select
                    name="category"
                    defaultValue={experience?.category ?? 'excursion'}
                    required
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {({excursion:'Excursion',evening:'Soirée',dining:'Restauration',wellness:'Bien-être',cultural:'Culturel',adventure:'Aventure'} as Record<string,string>)[c] ?? c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Prestataire
                  </label>
                  <select
                    name="provider_id"
                    defaultValue={experience?.provider_id ?? ''}
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <option value="">Aucun prestataire</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <BilingualField
                label="Description courte (≈ 160 caractères)"
                enName="short_description"
                frName="short_description__fr"
                defaultEn={experience?.short_description ?? ''}
                defaultFr={tr.short_description ?? ''}
                multiline
                rows={2}
              />
            </FormSection>

            <FormSection title="Description" description="Supporte le Markdown">
              <BilingualField
                label="Description complète"
                enName="description"
                frName="description__fr"
                defaultEn={experience?.description ?? ''}
                defaultFr={tr.description ?? ''}
                multiline
                rows={8}
              />
            </FormSection>

            <FormSection title="Tarification">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Prix (USD) <span className="text-coral">*</span>
                  </label>
                  <Input type="number" name="price_usd" defaultValue={experience?.price_usd ?? 0} min={0} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Unité de prix
                  </label>
                  <select
                    name="price_unit"
                    defaultValue={experience?.price_unit ?? 'per_person'}
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {PRICE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {({per_person:'par personne',per_group:'par groupe',flat:'forfait'} as Record<string,string>)[u] ?? u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Voyageurs min
                  </label>
                  <Input type="number" name="min_guests" defaultValue={experience?.min_guests ?? ''} min={1} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Voyageurs max
                  </label>
                  <Input type="number" name="max_guests" defaultValue={experience?.max_guests ?? ''} min={1} />
                </div>
                <div className="sm:col-span-2">
                  <BilingualField
                    label="Durée"
                    enName="duration"
                    frName="duration__fr"
                    defaultEn={experience?.duration ?? ''}
                    defaultFr={tr.duration ?? ''}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Point de rendez-vous & saisonnalité">
              <BilingualField
                label="Point de rendez-vous"
                enName="meeting_point"
                frName="meeting_point__fr"
                defaultEn={experience?.meeting_point ?? ''}
                defaultFr={tr.meeting_point ?? ''}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="seasonal"
                  name="seasonal"
                  value="true"
                  checked={seasonal}
                  onChange={(e) => setSeasonal(e.target.checked)}
                  className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                />
                <label htmlFor="seasonal" className="font-sans text-sm font-medium text-midnight cursor-pointer">
                  Saisonnier
                </label>
              </div>
              {seasonal && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                      Début de saison
                    </label>
                    <Input type="date" name="season_start" defaultValue={experience?.season_start ?? ''} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                      Fin de saison
                    </label>
                    <Input type="date" name="season_end" defaultValue={experience?.season_end ?? ''} />
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Points forts" description="Un point fort par ligne (français et anglais)">
              <BilingualField
                label="Points forts — un par ligne"
                enName="highlights"
                frName="highlights__fr"
                defaultEn={(experience?.highlights ?? []).join('\n')}
                defaultFr={tr.highlights ?? ''}
                multiline
                rows={5}
              />
            </FormSection>

            <FormSection title="Visibilité">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Popularité (0–100)
                  </label>
                  <Input type="number" name="popularity" defaultValue={experience?.popularity ?? 0} min={0} max={100} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    value="true"
                    defaultChecked={experience?.featured ?? false}
                    className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                  />
                  <span className="font-sans text-sm text-midnight">Mis en avant</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    value="true"
                    defaultChecked={experience?.active ?? true}
                    className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                  />
                  <span className="font-sans text-sm text-midnight">Actif</span>
                </label>
              </div>
            </FormSection>

            <FormSection title="Image de couverture">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  URL image de couverture
                </label>
                <ImageUploadField
                  name="cover_image_url"
                  defaultValue={experience?.cover_image_url}
                  bucket="experiences-media"
                  prefix="covers"
                />
              </div>
              <BilingualField
                label="Texte alternatif (alt)"
                enName="cover_image_alt"
                frName="cover_image_alt__fr"
                defaultEn={experience?.cover_image_alt ?? ''}
                defaultFr={tr.cover_image_alt ?? ''}
              />
            </FormSection>

            <FormSection title="SEO">
              <BilingualField
                label="Titre SEO (≈ 70 caractères)"
                enName="seo_title"
                frName="seo_title__fr"
                defaultEn={experience?.seo_title ?? ''}
                defaultFr={tr.seo_title ?? ''}
              />
              <BilingualField
                label="Description SEO (≈ 170 caractères)"
                enName="seo_description"
                frName="seo_description__fr"
                defaultEn={experience?.seo_description ?? ''}
                defaultFr={tr.seo_description ?? ''}
                multiline
                rows={3}
              />
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}
