'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  galleryCategories,
  type GalleryCategory,
  type GalleryImage,
} from '@/lib/data/gallery-images'
import { Lightbox } from './Lightbox'

/**
 * GalleryGrid — orchestrates the gallery experience.
 *
 *  - Holds the active filter category (local React state).
 *  - Renders the category chips at the top.
 *  - Renders a CSS-columns "masonry" — each image's natural aspect ratio
 *    drives its rendered height, so the layout self-organises without JS.
 *  - Opens the `<Lightbox />` on click and feeds it the currently
 *    filtered subset, so left/right navigation respects the filter.
 *
 * Design decision — CSS columns vs grid: `column-count` is the lowest-
 * complexity masonry pattern that works in every browser. It does flow
 * top→bottom column-first (not left→right) which is acceptable for an
 * editorial gallery where reading order is not strict.
 */

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | 'all'>('all')
  const [activeRoom, setActiveRoom] = useState<number | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Rooms that actually have photos, in order. Built from the data rather than
  // hardcoded 1 to 5, so a room with nothing in it shows no empty chip.
  const rooms = useMemo(() => {
    const found = new Set<number>()
    for (const img of images) {
      if (img.category === 'bedroom' && typeof img.room === 'number') found.add(img.room)
    }
    return [...found].sort((a, b) => a - b)
  }, [images])

  const filteredImages = useMemo(() => {
    const byCategory =
      activeCategory === 'all'
        ? images
        : images.filter((img) => img.category === activeCategory)
    // A room only narrows the bedroom category; elsewhere it means nothing.
    if (activeCategory !== 'bedroom' || activeRoom === 'all') return byCategory
    return byCategory.filter((img) => img.room === activeRoom)
  }, [images, activeCategory, activeRoom])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  return (
    <>
      {/* ─── Category filter chips ───────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter gallery by category"
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      >
        {galleryCategories.map((cat) => {
          const isActive = cat.value === activeCategory
          return (
            <button
              key={cat.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(cat.value)
                if (cat.value !== 'bedroom') setActiveRoom('all')
              }}
              className={cn(
                'rounded-full border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider2 transition-all duration-200 ease-luxe',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
                isActive
                  ? 'border-midnight bg-midnight text-gold shadow-soft'
                  : 'border-pearl-400 bg-pearl text-midnight-400 hover:border-midnight hover:text-midnight',
              )}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ─── Room chips, second level under Bedrooms ─────────────────── */}
      {activeCategory === 'bedroom' && rooms.length > 0 ? (
        <div
          role="tablist"
          aria-label="Filter bedrooms by room"
          className="mt-3 flex flex-wrap items-center justify-center gap-2"
        >
          {(['all', ...rooms] as Array<number | 'all'>).map((room) => {
            const isActive = room === activeRoom
            return (
              <button
                key={room}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveRoom(room)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 font-sans text-xs font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
                  isActive
                    ? 'border-gold bg-gold/10 text-midnight'
                    : 'border-pearl-400 bg-pearl text-midnight-400 hover:border-gold hover:text-midnight',
                )}
              >
                {room === 'all' ? 'All rooms' : `Bedroom ${room}`}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* ─── Masonry grid (CSS columns) ──────────────────────────────── */}
      <div
        className={cn(
          'mt-12 sm:mt-16',
          // gap between columns
          'gap-4 sm:gap-5',
          // column counts per breakpoint
          'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
        )}
      >
        {filteredImages.length === 0 ? (
          <p className="py-16 text-center font-sans text-body-md text-midnight-400">
            No photos in this category yet.
          </p>
        ) : (
          filteredImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openLightbox(index)}
              className={cn(
                'group relative mb-4 block w-full overflow-hidden rounded-lg sm:mb-5',
                'break-inside-avoid',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
              )}
              aria-label={`Open image: ${image.alt}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="block h-auto w-full bg-pearl-400 object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
              />
              {/* Caption overlay — hover only, no permanent darkening */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 flex items-end justify-start',
                  'bg-gradient-to-t from-midnight/60 via-midnight/20 to-transparent',
                  'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                )}
              >
                <div className="p-4 sm:p-5">
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider2 text-gold">
                    {image.category}
                  </p>
                  {image.caption ? (
                    <p className="mt-1 font-sans text-body-sm text-pearl">{image.caption}</p>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <Lightbox
        images={filteredImages}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
      />
    </>
  )
}
