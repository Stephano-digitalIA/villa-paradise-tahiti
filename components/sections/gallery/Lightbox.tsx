'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/lib/data/gallery-images'

/**
 * Lightbox — fullscreen image viewer with keyboard + click navigation.
 *
 * Implementation notes:
 *  - Pure React state, no external libs. Renders via `createPortal` into
 *    `document.body` so it escapes any transformed/positioned ancestors.
 *  - Locks body scroll while open.
 *  - Keyboard: ←/→ to navigate, Esc to close.
 *  - Initial focus lands on the close button (basic focus trap is enough
 *    for a viewer of this scope — assistive tech can still escape via Tab).
 *  - Uses native `<img>` instead of `next/image` because `next/image` is
 *    awkward in dynamic, full-viewport modals (no fill on body-portal).
 *
 * The component is "uncontrolled" in the sense that the parent owns
 * `images` + `initialIndex` + `isOpen`. The lightbox owns navigation state
 * internally but resyncs whenever `initialIndex` changes.
 */

export interface LightboxProps {
  images: GalleryImage[]
  /** Index of the image to display first when opening. */
  initialIndex: number
  /** Whether the lightbox is open. */
  isOpen: boolean
  /** Fired when the user requests to close (Esc, backdrop, close button). */
  onClose: () => void
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Ensure portal target exists (SSR safety).
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync external index changes (e.g. user clicks a different thumb while open).
  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + images.length) % images.length)
  }, [images.length])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % images.length)
  }, [images.length])

  // Keyboard handling — only active while open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goPrev()
          break
        case 'ArrowRight':
          goNext()
          break
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, goPrev, goNext])

  // Lock body scroll while open + focus the close button on mount.
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Defer focus so the element exists when the portal renders.
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(t)
    }
  }, [isOpen])

  if (!mounted || !isOpen || images.length === 0) {
    return null
  }

  const image = images[index] ?? images[0]
  if (!image) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer — ${image.alt}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/95 animate-fade-in"
    >
      {/* Backdrop — clicking closes. */}
      <button
        type="button"
        aria-label="Close gallery"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Close button — top right. */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close gallery (Esc)"
        className={cn(
          'absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center',
          'rounded-full border border-pearl/30 bg-midnight/60 text-pearl backdrop-blur',
          'transition hover:border-gold hover:bg-midnight/80 hover:text-gold',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
        )}
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Prev */}
      {images.length > 1 ? (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image (Left arrow)"
          className={cn(
            'absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center',
            'rounded-full border border-pearl/30 bg-midnight/60 text-pearl backdrop-blur',
            'transition hover:border-gold hover:bg-midnight/80 hover:text-gold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            'sm:left-8',
          )}
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : null}

      {/* Next */}
      {images.length > 1 ? (
        <button
          type="button"
          onClick={goNext}
          aria-label="Next image (Right arrow)"
          className={cn(
            'absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center',
            'rounded-full border border-pearl/30 bg-midnight/60 text-pearl backdrop-blur',
            'transition hover:border-gold hover:bg-midnight/80 hover:text-gold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            'sm:right-8',
          )}
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : null}

      {/* Image + caption */}
      <figure className="relative z-[1] mx-auto flex max-h-[92vh] w-full max-w-6xl flex-col items-center px-4 sm:px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.id}
          src={image.url}
          alt={image.alt}
          loading="eager"
          className="max-h-[80vh] w-auto rounded-lg object-contain shadow-elevated animate-fade-in"
        />
        <figcaption className="mt-4 max-w-2xl text-center font-sans text-body-sm text-pearl/80">
          {image.caption ?? image.alt}
          <span className="ml-3 text-eyebrow tracking-wider2 text-pearl/50">
            {index + 1} / {images.length}
          </span>
        </figcaption>
      </figure>
    </div>,
    document.body,
  )
}
