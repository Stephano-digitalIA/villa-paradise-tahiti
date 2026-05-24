'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// ImageUploadInput — file input with preview and upload progress
// NOTE: Actual storage upload must happen in a Server Action; this component
// manages local preview + passes the File via a hidden input or form submission.
// ─────────────────────────────────────────────────────────────────────────────

type ImageUploadInputProps = {
  name: string
  label?: string
  currentUrl?: string | null
  accept?: string
  required?: boolean
  multiple?: boolean
  hint?: string
}

export function ImageUploadInput({
  name,
  label = 'Upload image',
  currentUrl,
  accept = 'image/*',
  required,
  multiple = false,
  hint,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const previewList = previews.length > 0 ? previews : currentUrl ? [currentUrl] : []

  return (
    <div className="space-y-3">
      {label && (
        <label className="block font-sans text-sm font-medium text-midnight">
          {label}
          {required && <span className="ml-1 text-coral">*</span>}
        </label>
      )}

      {/* Previews */}
      {previewList.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previewList.map((url, i) => (
            <div
              key={i}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-pearl-400 bg-pearl-300"
            >
              <Image
                src={url}
                alt={`Preview ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={url.startsWith('blob:')}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-pearl-400 px-6 py-8 text-center transition-colors hover:border-gold hover:bg-gold/5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-midnight-300"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="font-sans text-sm text-midnight-400">
          {previews.length > 0 ? 'Click to change' : 'Click to upload'}
        </span>
        {hint && <span className="font-sans text-xs text-midnight-300">{hint}</span>}
      </button>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        required={required}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  )
}
