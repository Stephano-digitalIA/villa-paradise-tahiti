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

  /**
   * The grid is drawn section by section.
   *
   * Everywhere but Bedrooms that is a single unnamed section, exactly as
   * before. Under Bedrooms with no room selected it becomes one section per
   * room, each with its own heading: five rooms poured into one masonry look
   * like one large bedroom, and a visitor cannot tell which photo belongs
   * where. Photos with no room assigned yet close the list under their own
   * heading rather than being dropped.
   */
  const sections = useMemo(() => {
    // `rooms.length === 0` covers the state before any room has been assigned:
    // grouping then would put every photo under a single "More bedrooms"
    // heading, which says less than no heading at all.
    if (activeCategory !== 'bedroom' || activeRoom !== 'all' || rooms.length === 0) {
      return [{ key: 'all', title: null as string | null, images: filteredImages }]
    }
    const out: Array<{ key: string; title: string | null; images: GalleryImage[] }> = []
    for (const room of rooms) {
      const inRoom = filteredImages.filter((img) => img.room === room)
      if (inRoom.length > 0) {
        out.push({ key: `room-${room}`, title: `Bedroom ${room}`, images: inRoom })
      }
    }
    const unassigned = filteredImages.filter((img) => typeof img.room !== 'number')
    if (unassigned.length > 0) {
      out.push({ key: 'unassigned', title: 'More bedrooms', images: unassigned })
    }
    return out
  }, [activeCategory, activeRoom, filteredImages, rooms])

  /**
   * The lightbox walks a flat list, so it gets the sections concatenated in
   * the order they are drawn. Arrowing right therefore moves through the
   * current room and on into the next one, which is what the layout implies.
   */
  const lightboxImages = useMemo(
    () => sections.flatMap((section) => section.images),
    [sections],
  )

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

      {/* ─── Masonry grid (CSS columns), one block per section ───────── */}
      {lightboxImages.length === 0 ? (
        <p className="py-16 text-center font-sans text-body-md text-midnight-400">
          No photos in this category yet.
        </p>
      ) : (
        sections.map((section, sectionIndex) => {
          // Index the lightbox against the flattened list, so clicking a photo
          // in the third room opens that photo and not the third of the first.
          const offset = sections
            .slice(0, sectionIndex)
            .reduce((n, s2) => n + s2.images.length, 0)

          return (
            <section key={section.key} aria-label={section.title ?? undefined}>
              {section.title ? (
                <h3 className="mt-12 flex items-center gap-4 font-heading text-h3-luxe font-medium text-midnight sm:mt-16">
                  <span className="whitespace-nowrap">{section.title}</span>
                  <span className="h-px flex-1 bg-pearl-400" aria-hidden="true" />
                  <span className="whitespace-nowrap font-sans text-xs font-normal uppercase tracking-wider2 text-midnight-400">
                    {section.images.length} photo{section.images.length > 1 ? 's' : ''}
                  </span>
                </h3>
              ) : null}

              <div
                className={cn(
                  section.title ? 'mt-6' : 'mt-12 sm:mt-16',
                  // gap between columns
                  'gap-4 sm:gap-5',
                  // column counts per breakpoint
                  'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
                )}
              >
                {section.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => openLightbox(offset + index)}
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
                    {/* Caption overlay, hover only, no permanent darkening */}
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 flex items-end justify-start',
                        'bg-gradient-to-t from-midnight/60 via-midnight/20 to-transparent',
                        'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                      )}
                    >
                      <div className="p-4 sm:p-5">
                        <p className="font-sans text-xs font-semibold uppercase tracking-wider2 text-gold">
                          {typeof image.room === 'number'
                            ? `Bedroom ${image.room}`
                            : image.category}
                        </p>
                        {image.caption ? (
                          <p className="mt-1 font-sans text-body-sm text-pearl">
                            {image.caption}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}

      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
      />
    </>
  )
}
