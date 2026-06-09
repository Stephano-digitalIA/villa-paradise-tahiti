'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { BilingualField } from '@/components/admin/BilingualField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Review, ReviewRating, ReviewSource } from '@/lib/supabase/types'
import { createReview, updateReview } from './actions'

const SOURCES: ReviewSource[] = ['direct', 'airbnb', 'vrbo', 'google', 'tripadvisor']

type Props = { review?: Review | null }

export function ReviewForm({ review }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState<ReviewRating>(review?.rating ?? 5)

  const isEdit = Boolean(review)
  const tr = review?.translations ?? {}

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('rating', String(rating))
    setError(null)
    startTransition(async () => {
      try {
        if (review) {
          await updateReview(review.id, fd)
        } else {
          await createReview(fd)
        }
        router.push('/admin/content/reviews')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-midnight">
          {isEdit ? 'Éditer l\'avis' : 'Ajouter un avis'}
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/content/reviews')}>
            Annuler
          </Button>
          <Button type="submit" form="review-form" disabled={isPending} size="sm">
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer l\'avis'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 font-sans text-sm text-coral">
          {error}
        </div>
      )}

      <form id="review-form" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="px-8">
            <FormSection title="Auteur">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Nom de l&apos;auteur <span className="text-coral">*</span>
                  </label>
                  <Input name="author_name" defaultValue={review?.author_name} required />
                </div>
              </div>
              <BilingualField
                label="Lieu"
                enName="author_location"
                frName="author_location__fr"
                defaultEn={review?.author_location ?? ''}
                defaultFr={tr.author_location ?? ''}
              />
            </FormSection>

            <FormSection title="Contenu de l'avis">
              {/* Star rating */}
              <div>
                <label className="mb-2 block font-sans text-sm font-medium text-midnight">
                  Note
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as ReviewRating)}
                      className={`text-2xl transition-colors ${n <= rating ? 'text-gold' : 'text-midnight-200 hover:text-gold/50'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 self-center font-sans text-sm text-midnight-400">
                    {rating}/5
                  </span>
                </div>
              </div>
              <BilingualField
                label="Titre"
                enName="title"
                frName="title__fr"
                defaultEn={review?.title ?? ''}
                defaultFr={tr.title ?? ''}
              />
              <BilingualField
                label="Texte"
                enName="body"
                frName="body__fr"
                defaultEn={review?.body ?? ''}
                defaultFr={tr.body ?? ''}
                multiline
                rows={5}
              />
            </FormSection>

            <FormSection title="Dates du séjour">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Arrivée
                  </label>
                  <Input type="date" name="stay_from" defaultValue={review?.stay_from ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Départ
                  </label>
                  <Input type="date" name="stay_to" defaultValue={review?.stay_to ?? ''} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Métadonnées">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Source
                  </label>
                  <select
                    name="source"
                    defaultValue={review?.source ?? 'direct'}
                    className="h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Publié le
                  </label>
                  <Input
                    type="datetime-local"
                    name="published_at"
                    defaultValue={
                      review?.published_at
                        ? review.published_at.slice(0, 16)
                        : new Date().toISOString().slice(0, 16)
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="verified"
                    value="true"
                    defaultChecked={review?.verified ?? false}
                    className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                  />
                  <span className="font-sans text-sm text-midnight">Vérifié</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    value="true"
                    defaultChecked={review?.featured ?? false}
                    className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                  />
                  <span className="font-sans text-sm text-midnight">Mis en avant</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}
