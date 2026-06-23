'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { BilingualField } from '@/components/admin/BilingualField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { ToggleSwitch } from '@/components/admin/ToggleSwitch'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Post } from '@/lib/supabase/types'
import { createPost, updatePost } from './actions'

type Props = { post?: Post | null }

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function PostForm({ post }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState(post?.slug ?? '')
  // Publish status — ON = published (uses the date below), OFF = draft (hidden).
  const [published, setPublished] = useState(post?.published_at != null)

  const isEdit = Boolean(post)
  const tr = post?.translations ?? {}

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        if (post) {
          await updatePost(post.id, fd)
        } else {
          await createPost(fd)
        }
        router.push('/admin/content/blog')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-midnight">
          {isEdit ? 'Éditer l\'article' : 'Nouvel article'}
        </h1>
        <div className="flex items-center gap-3">
          {/* Publish status — contrasted card (red = published, green = draft). */}
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 ${
              published
                ? 'border-coral/40 bg-coral/10'
                : 'border-leaf/40 bg-leaf/10'
            }`}
          >
            <span
              className={`font-sans text-xs font-bold uppercase tracking-wide ${
                published ? 'text-coral' : 'text-leaf'
              }`}
            >
              {published ? 'Publié' : 'Brouillon'}
            </span>
            <ToggleSwitch
              checked={published}
              onToggle={async () => setPublished((v) => !v)}
              label="Publier l’article"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/content/blog')}>
            Annuler
          </Button>
          <Button type="submit" form="post-form" disabled={isPending} size="sm">
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer l\'article'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 font-sans text-sm text-coral">
          {error}
        </div>
      )}

      <form id="post-form" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="px-8">
            <FormSection title="Informations de base">
              <BilingualField
                label="Titre"
                enName="title"
                frName="title__fr"
                defaultEn={post?.title ?? ''}
                defaultFr={tr.title ?? ''}
                onEnChange={(v) => {
                  if (!post) setSlug(slugify(v))
                }}
              />
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Slug
                </label>
                <Input
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-généré"
                />
              </div>
              <BilingualField
                label="Extrait (≈ 220 caractères)"
                enName="excerpt"
                frName="excerpt__fr"
                defaultEn={post?.excerpt ?? ''}
                defaultFr={tr.excerpt ?? ''}
                multiline
                rows={3}
              />
            </FormSection>

            <FormSection title="Corps" description="Supporte le Markdown">
              <BilingualField
                label="Corps de l'article"
                enName="body"
                frName="body__fr"
                defaultEn={post?.body ?? ''}
                defaultFr={tr.body ?? ''}
                multiline
                rows={15}
              />
            </FormSection>

            <FormSection title="Image de couverture">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  URL image de couverture
                </label>
                <ImageUploadField
                  name="cover_image_url"
                  defaultValue={post?.cover_image_url}
                  bucket="blog-media"
                  prefix="covers"
                />
              </div>
              <BilingualField
                label="Texte alternatif (alt)"
                enName="cover_image_alt"
                frName="cover_image_alt__fr"
                defaultEn={post?.cover_image_alt ?? ''}
                defaultFr={tr.cover_image_alt ?? ''}
              />
            </FormSection>

            <FormSection title="Auteur">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Nom de l&apos;auteur
                  </label>
                  <Input name="author_name" defaultValue={post?.author_name ?? ''} />
                </div>
              </div>
              <BilingualField
                label="Bio de l’auteur"
                enName="author_bio"
                frName="author_bio__fr"
                defaultEn={post?.author_bio ?? ''}
                defaultFr={tr.author_bio ?? ''}
                multiline
                rows={2}
              />
            </FormSection>

            <FormSection title="Tags & métadonnées">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Tags{' '}
                    <span className="font-normal text-midnight-400">(séparés par des virgules)</span>
                  </label>
                  <Input
                    name="tags"
                    defaultValue={(post?.tags ?? []).join(', ')}
                    placeholder="tahiti, lagon, voyage"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Temps de lecture (min)
                  </label>
                  <Input
                    type="number"
                    name="reading_time_min"
                    defaultValue={post?.reading_time_min ?? ''}
                    min={1}
                  />
                </div>
              </div>
              {/* Carries the publish toggle state (controlled from the hero) to
                  the server action — the toggle UI lives in the header above. */}
              <input type="hidden" name="published" value={published ? 'true' : 'false'} />
              {published ? (
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Date de publication{' '}
                    <span className="font-normal text-midnight-400">
                      (vide = maintenant ; date future = programmé)
                    </span>
                  </label>
                  <Input
                    type="datetime-local"
                    name="published_at"
                    defaultValue={
                      post?.published_at ? post.published_at.slice(0, 16) : ''
                    }
                  />
                </div>
              ) : null}
            </FormSection>

            <FormSection title="SEO">
              <BilingualField
                label="Titre SEO (≈ 70 caractères)"
                enName="seo_title"
                frName="seo_title__fr"
                defaultEn={post?.seo_title ?? ''}
                defaultFr={tr.seo_title ?? ''}
              />
              <BilingualField
                label="Description SEO (≈ 170 caractères)"
                enName="seo_description"
                frName="seo_description__fr"
                defaultEn={post?.seo_description ?? ''}
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
