'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, Loader2 } from 'lucide-react'

import { uploadImage } from '@/app/actions/upload-image'

interface ImageUploadFieldProps {
  /** Form field name carrying the image URL (e.g. "hero_image_url"). */
  name: string
  /** Current URL (edit mode). */
  defaultValue?: string | null
  /** Supabase Storage bucket. */
  bucket: 'villa-media' | 'experiences-media' | 'blog-media' | 'reviews-media'
  /** Folder prefix inside the bucket (e.g. "hero", "covers"). */
  prefix: string
}

/**
 * Admin image field — a single way to set an image: upload a file (→ Supabase
 * Storage). The resulting URL is carried to the surrounding form via a hidden
 * input named `{name}`; a thumbnail previews the current image and "Retirer"
 * clears it.
 */
export function ImageUploadField({
  name,
  defaultValue,
  bucket,
  prefix,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const fd = new FormData()
    fd.set('file', file)
    fd.set('bucket', bucket)
    fd.set('prefix', prefix)
    startTransition(async () => {
      const res = await uploadImage(fd)
      if ('error' in res) setError(res.error)
      else setUrl(res.url)
      if (fileRef.current) fileRef.current.value = ''
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {url ? (
          <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg border border-pearl-400 bg-pearl-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg border border-dashed border-pearl-400 bg-pearl-100 text-midnight-300">
            <Image src="/placeholder.svg" alt="" width={20} height={20} aria-hidden />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Hidden field carries the uploaded image URL to the surrounding form. */}
          <input type="hidden" name={name} value={url} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-pearl-400 bg-white px-3 py-1.5 font-sans text-xs font-medium text-midnight transition-colors hover:bg-pearl-100 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Upload className="h-3.5 w-3.5" aria-hidden />
              )}
              {pending ? 'Téléversement…' : url ? 'Remplacer l’image' : 'Téléverser une image'}
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl('')}
                disabled={pending}
                className="font-sans text-xs font-medium text-coral underline-offset-2 hover:underline disabled:opacity-60"
              >
                Retirer
              </button>
            ) : null}
            <span className="font-sans text-xs text-midnight-300">JPG/PNG/WebP · 8 Mo max</span>
          </div>
          {error ? (
            <p className="mt-1.5 font-sans text-xs text-coral">{error}</p>
          ) : null}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
