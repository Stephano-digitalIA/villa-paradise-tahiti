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
 * Admin image field — upload a file (→ Supabase Storage) OR paste a URL.
 * Renders a controlled text input named `{name}` so the surrounding form
 * submits the resulting URL exactly like the old plain-URL field.
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
          <input
            type="text"
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or upload a file"
            className="w-full rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <div className="mt-2 flex items-center gap-3">
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
              {pending ? 'Uploading…' : 'Upload image'}
            </button>
            <span className="font-sans text-xs text-midnight-300">JPG/PNG/WebP · 8 MB max</span>
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
