'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
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
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState(experience?.slug ?? '')
  const [seasonal, setSeasonal] = useState(experience?.seasonal ?? false)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!experience) {
      setSlug(slugify(e.target.value))
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setStatus('saving')
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
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const isEdit = Boolean(experience)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">
            {isEdit ? 'Edit Experience' : 'New Experience'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/content/experiences')}>
            Cancel
          </Button>
          <Button type="submit" form="exp-form" disabled={isPending} size="sm">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Experience'}
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
            <FormSection title="Basic Info">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Title <span className="text-coral">*</span>
                  </label>
                  <Input
                    name="title"
                    defaultValue={experience?.title}
                    required
                    onChange={handleTitleChange}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Slug
                  </label>
                  <Input
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated from title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Category <span className="text-coral">*</span>
                  </label>
                  <select
                    name="category"
                    defaultValue={experience?.category ?? 'excursion'}
                    required
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Provider
                  </label>
                  <select
                    name="provider_id"
                    defaultValue={experience?.provider_id ?? ''}
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <option value="">No provider</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Short Description <span className="text-coral">*</span>{' '}
                  <span className="font-normal text-midnight-400">(max 160 chars)</span>
                </label>
                <textarea
                  name="short_description"
                  rows={2}
                  maxLength={160}
                  required
                  defaultValue={experience?.short_description}
                  className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </FormSection>

            <FormSection title="Description" description="Supports Markdown">
              <MarkdownEditor
                name="description"
                label="Full Description"
                defaultValue={experience?.description}
                rows={8}
              />
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Price (USD) <span className="text-coral">*</span>
                  </label>
                  <Input type="number" name="price_usd" defaultValue={experience?.price_usd ?? 0} min={0} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Price Unit
                  </label>
                  <select
                    name="price_unit"
                    defaultValue={experience?.price_unit ?? 'per_person'}
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {PRICE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Min Guests
                  </label>
                  <Input type="number" name="min_guests" defaultValue={experience?.min_guests ?? ''} min={1} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Max Guests
                  </label>
                  <Input type="number" name="max_guests" defaultValue={experience?.max_guests ?? ''} min={1} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Duration
                  </label>
                  <Input name="duration" defaultValue={experience?.duration ?? ''} placeholder="3 hours" />
                </div>
              </div>
            </FormSection>

            <FormSection title="Meeting Point & Season">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Meeting Point
                </label>
                <Input name="meeting_point" defaultValue={experience?.meeting_point ?? ''} />
              </div>
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
                  Seasonal
                </label>
              </div>
              {seasonal && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                      Season Start
                    </label>
                    <Input type="date" name="season_start" defaultValue={experience?.season_start ?? ''} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                      Season End
                    </label>
                    <Input type="date" name="season_end" defaultValue={experience?.season_end ?? ''} />
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Highlights" description="One highlight per line">
              <textarea
                name="highlights"
                rows={5}
                defaultValue={(experience?.highlights ?? []).join('\n')}
                placeholder="Snorkel in crystal-clear waters&#10;Guided by certified instructors&#10;Equipment included"
                className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </FormSection>

            <FormSection title="Visibility">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Popularity (0–100)
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
                  <span className="font-sans text-sm text-midnight">Featured</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    value="true"
                    defaultChecked={experience?.active ?? true}
                    className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                  />
                  <span className="font-sans text-sm text-midnight">Active</span>
                </label>
              </div>
            </FormSection>

            <FormSection title="Cover Image">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Cover Image URL
                  </label>
                  <Input name="cover_image_url" defaultValue={experience?.cover_image_url ?? ''} placeholder="https://…" />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Cover Image Alt
                  </label>
                  <Input name="cover_image_alt" defaultValue={experience?.cover_image_alt ?? ''} />
                </div>
              </div>
            </FormSection>

            <FormSection title="SEO">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  SEO Title <span className="font-normal text-midnight-400">(max 70 chars)</span>
                </label>
                <Input name="seo_title" defaultValue={experience?.seo_title ?? ''} maxLength={70} />
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  SEO Description <span className="font-normal text-midnight-400">(max 170 chars)</span>
                </label>
                <textarea
                  name="seo_description"
                  rows={3}
                  maxLength={170}
                  defaultValue={experience?.seo_description ?? ''}
                  className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}
