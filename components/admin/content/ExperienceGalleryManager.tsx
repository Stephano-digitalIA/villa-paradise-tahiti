'use client'

import { useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Upload, X } from 'lucide-react'

import {
  addGalleryImage,
  deleteGalleryImage,
  reorderGalleryImage,
  updateGalleryImageAlt,
} from '@/app/actions/experience-gallery'
import type { ExperienceGalleryItem } from '@/lib/supabase/types'

interface ExperienceGalleryManagerProps {
  experienceId: string
  experienceSlug: string
  initialImages: ExperienceGalleryItem[]
}

type AddMode = 'upload' | 'url'

export function ExperienceGalleryManager({
  experienceId,
  experienceSlug,
  initialImages,
}: ExperienceGalleryManagerProps) {
  const router = useRouter()
  const images = [...initialImages].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-base font-semibold text-midnight">
            Gallery
          </h2>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Photos shown on the public experience page, below the cover image.
            Drag the cover image into the form above; add additional photos here.
          </p>
        </div>
        <span className="rounded-full bg-pearl-300/60 px-2.5 py-0.5 font-sans text-xs font-medium text-midnight-400">
          {images.length} photo{images.length !== 1 ? 's' : ''}
        </span>
      </header>

      <AddImageForm
        experienceId={experienceId}
        experienceSlug={experienceSlug}
        onSuccess={() => router.refresh()}
      />

      {images.length === 0 ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-pearl-400 px-6 py-12 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-midnight-300" aria-hidden="true" />
          <p className="mt-2 font-sans text-sm text-midnight-400">
            No photos yet — add the first one above.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, idx) => (
            <ImageCard
              key={image.id}
              image={image}
              experienceId={experienceId}
              experienceSlug={experienceSlug}
              isFirst={idx === 0}
              isLast={idx === images.length - 1}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */

interface AddImageFormProps {
  experienceId: string
  experienceSlug: string
  onSuccess: () => void
}

function AddImageForm({
  experienceId,
  experienceSlug,
  onSuccess,
}: AddImageFormProps) {
  const [mode, setMode] = useState<AddMode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setFile(null)
    setUrl('')
    setAlt('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    if (mode === 'upload' && !file) {
      setError('Pick a file first')
      return
    }
    if (mode === 'url' && !url.trim()) {
      setError('Paste an image URL')
      return
    }
    setError(null)

    const formData = new FormData()
    formData.set('experience_id', experienceId)
    formData.set('experience_slug', experienceSlug)
    formData.set('alt', alt)
    if (mode === 'upload' && file) formData.set('file', file)
    if (mode === 'url') formData.set('url', url)

    startTransition(async () => {
      const res = await addGalleryImage(formData)
      if (!res.ok) {
        setError(res.error)
        return
      }
      reset()
      onSuccess()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-pearl-400 bg-pearl-300/30 p-4"
    >
      <div className="flex items-center gap-2">
        <ModeTab
          active={mode === 'upload'}
          onClick={() => setMode('upload')}
          icon={<Upload className="h-3.5 w-3.5" />}
          label="Upload file"
        />
        <ModeTab
          active={mode === 'url'}
          onClick={() => setMode('url')}
          icon={<LinkIcon className="h-3.5 w-3.5" />}
          label="Paste URL"
        />
      </div>

      {mode === 'upload' ? (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={pending}
            className="block w-full cursor-pointer rounded-lg border border-pearl-400 bg-white file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-midnight file:px-3 file:py-2 file:font-sans file:text-xs file:font-semibold file:text-pearl hover:file:bg-midnight/90 disabled:opacity-60"
          />
        </div>
      ) : (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={pending}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
        />
      )}

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          disabled={pending}
          maxLength={200}
          placeholder="Alt text (helps SEO + accessibility)"
          className="flex-1 rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 font-sans text-sm font-semibold text-midnight shadow-sm transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:bg-gold/40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {pending ? 'Adding…' : 'Add photo'}
        </button>
      </div>

      {error ? (
        <p role="alert" className="font-sans text-xs text-coral">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors ' +
        (active
          ? 'bg-midnight text-pearl'
          : 'bg-white text-midnight-400 hover:text-midnight border border-pearl-400')
      }
    >
      {icon}
      {label}
    </button>
  )
}

/* ───────────────────────────────────────────────────────────── */

interface ImageCardProps {
  image: ExperienceGalleryItem
  experienceId: string
  experienceSlug: string
  isFirst: boolean
  isLast: boolean
}

function ImageCard({
  image,
  experienceId,
  experienceSlug,
  isFirst,
  isLast,
}: ImageCardProps) {
  const router = useRouter()
  const [altDraft, setAltDraft] = useState(image.alt ?? '')
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function saveAlt() {
    if (altDraft.trim() === (image.alt ?? '').trim()) return
    setError(null)
    startTransition(async () => {
      const res = await updateGalleryImageAlt(
        image.id,
        altDraft,
        experienceId,
        experienceSlug,
      )
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function reorder(direction: 'up' | 'down') {
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await reorderGalleryImage(
        image.id,
        direction,
        experienceId,
        experienceSlug,
      )
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function doDelete() {
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await deleteGalleryImage(image.id, experienceId, experienceSlug)
      if (!res.ok) {
        setError(res.error)
        setConfirmDelete(false)
        return
      }
      router.refresh()
    })
  }

  return (
    <li className="overflow-hidden rounded-xl border border-pearl-400 bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-pearl-300">
        <Image
          src={image.image_url}
          alt={image.alt ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        <span className="absolute left-2 top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-midnight/80 px-1.5 font-mono text-xs font-semibold text-pearl">
          {image.sort_order}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <input
          type="text"
          value={altDraft}
          onChange={(e) => setAltDraft(e.target.value)}
          onBlur={saveAlt}
          disabled={pending}
          maxLength={200}
          placeholder="Alt text"
          className="w-full rounded-md border border-pearl-400 bg-white px-2 py-1 font-sans text-xs text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <IconButton
              label="Move up"
              onClick={() => reorder('up')}
              disabled={pending || isFirst}
              icon={<ArrowUp className="h-3.5 w-3.5" />}
            />
            <IconButton
              label="Move down"
              onClick={() => reorder('down')}
              disabled={pending || isLast}
              icon={<ArrowDown className="h-3.5 w-3.5" />}
            />
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
                className="rounded-md p-1 text-midnight-400 hover:bg-pearl-300/60 hover:text-midnight"
                aria-label="Cancel delete"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-md bg-coral px-2 py-1 font-sans text-xs font-semibold text-white hover:bg-coral/90 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                {pending ? '…' : 'Delete'}
              </button>
            </div>
          ) : (
            <IconButton
              label="Delete photo"
              onClick={() => setConfirmDelete(true)}
              disabled={pending}
              icon={<Trash2 className="h-3.5 w-3.5 text-coral" />}
              hoverClassName="hover:bg-coral/10"
            />
          )}
        </div>

        {error ? (
          <p role="alert" className="font-sans text-xs text-coral">
            {error}
          </p>
        ) : null}
      </div>
    </li>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  icon,
  hoverClassName = 'hover:bg-pearl-300/60',
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  hoverClassName?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        'rounded-md p-1.5 text-midnight-400 transition-colors hover:text-midnight disabled:cursor-not-allowed disabled:opacity-40 ' +
        hoverClassName
      }
    >
      {icon}
    </button>
  )
}
