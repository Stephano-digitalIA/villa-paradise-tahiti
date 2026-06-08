'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
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

  const isEdit = Boolean(post)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!post) setSlug(slugify(e.target.value))
  }

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
        <div className="flex gap-3">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Titre <span className="text-coral">*</span>
                  </label>
                  <Input
                    name="title"
                    defaultValue={post?.title}
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
                    placeholder="auto-généré"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Extrait <span className="text-coral">*</span>{' '}
                  <span className="font-normal text-midnight-400">(220 caractères max)</span>
                </label>
                <textarea
                  name="excerpt"
                  rows={3}
                  required
                  maxLength={220}
                  defaultValue={post?.excerpt}
                  className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </FormSection>

            <FormSection title="Corps" description="Supporte le Markdown">
              <MarkdownEditor
                name="body"
                label="Corps de l'article"
                defaultValue={post?.body}
                rows={15}
              />
            </FormSection>

            <FormSection title="Image de couverture">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Texte alternatif (alt)
                  </label>
                  <Input name="cover_image_alt" defaultValue={post?.cover_image_alt ?? ''} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Auteur">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Nom de l&apos;auteur
                  </label>
                  <Input name="author_name" defaultValue={post?.author_name ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Bio de l&apos;auteur
                  </label>
                  <Input name="author_bio" defaultValue={post?.author_bio ?? ''} />
                </div>
              </div>
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
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Publié le{' '}
                  <span className="font-normal text-midnight-400">(laisser vide = brouillon)</span>
                </label>
                <Input
                  type="datetime-local"
                  name="published_at"
                  defaultValue={
                    post?.published_at ? post.published_at.slice(0, 16) : ''
                  }
                />
              </div>
            </FormSection>

            <FormSection title="SEO">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Titre SEO <span className="font-normal text-midnight-400">(70 caractères max)</span>
                </label>
                <Input name="seo_title" defaultValue={post?.seo_title ?? ''} maxLength={70} />
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Description SEO{' '}
                  <span className="font-normal text-midnight-400">(170 caractères max)</span>
                </label>
                <textarea
                  name="seo_description"
                  rows={3}
                  maxLength={170}
                  defaultValue={post?.seo_description ?? ''}
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
