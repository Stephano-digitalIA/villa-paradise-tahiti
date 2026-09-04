'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { GalleryCategory, GalleryItem } from '@/lib/supabase/types'
import {
  uploadGalleryImage,
  trashGalleryItem,
  restoreGalleryItem,
  deleteGalleryItemPermanently,
  updateGalleryOrder,
  updateGalleryText,
} from './actions'
import { translateBatch } from '@/app/actions/translate'

const CATEGORIES: GalleryCategory[] = [
  'exterior', 'interior', 'pool', 'lagoon', 'bedrooms', 'night', 'sunset', 'experiences',
]

const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  exterior: 'Extérieur',
  interior: 'Intérieur',
  pool: 'Piscine',
  lagoon: 'Lagon',
  bedrooms: 'Chambres',
  night: 'Nuit',
  sunset: 'Coucher de soleil',
  experiences: 'Expériences',
}

const CATEGORY_VARIANT: Record<GalleryCategory, 'default' | 'info' | 'success' | 'warning' | 'luxe' | 'gold'> = {
  exterior: 'default',
  interior: 'info',
  pool: 'success',
  lagoon: 'info',
  bedrooms: 'warning',
  night: 'luxe',
  sunset: 'gold',
  experiences: 'default',
}

type TextState = {
  alt: string
  caption: string
  altFr: string
  captionFr: string
  roomNumber: number | null
}

/** Rooms the villa actually has. Mirrors the CHECK in migration 018. */
const ROOMS = [1, 2, 3, 4, 5] as const

function textStateOf(i: GalleryItem): TextState {
  return {
    alt: i.alt ?? '',
    caption: i.caption ?? '',
    altFr: i.translations?.alt ?? '',
    captionFr: i.translations?.caption ?? '',
    roomNumber: i.room_number ?? null,
  }
}

type Props = { initialItems: GalleryItem[] }

export function GalleryClient({ initialItems }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [filterCat, setFilterCat] = useState<GalleryCategory | 'all'>('all')
  const [isPending, startTransition] = useTransition()
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Descriptions are edited in place. `caption` is what the site shows; `alt`
  // is the accessibility text and the caption's fallback.
  const [textMap, setTextMap] = useState<Record<string, TextState>>(
    Object.fromEntries(initialItems.map((i) => [i.id, textStateOf(i)])),
  )
  const [savedNotice, setSavedNotice] = useState(false)
  // Order is edited by dragging. `order` holds the ids of the live photos in
  // the order shown; sort_order is derived from the index on save, so the
  // numbers stay contiguous instead of drifting apart after a few moves.
  const [order, setOrder] = useState<string[]>(
    initialItems.filter((i) => !i.deleted_at).map((i) => i.id),
  )
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  // Id of the photo currently being translated, or 'all' for the bulk run.
  const [translating, setTranslating] = useState<string | null>(null)
  const [translateError, setTranslateError] = useState<string | null>(null)

  const live = useMemo(() => items.filter((i) => !i.deleted_at), [items])
  const trashed = useMemo(() => items.filter((i) => i.deleted_at), [items])

  const filtered = filterCat === 'all' ? live : live.filter((i) => i.category === filterCat)
  // Render in the dragged order. Photos absent from `order` (uploaded since the
  // page loaded) fall to the end rather than disappearing.
  const ordered = [...filtered].sort((a, b) => {
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
  })

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploadError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await uploadGalleryImage(fd)
        // Refresh — simple page reload to get updated list
        window.location.reload()
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Échec du téléversement')
      }
    })
  }

  const EMPTY: TextState = {
    alt: '',
    caption: '',
    altFr: '',
    captionFr: '',
    roomNumber: null,
  }

  function handleTextChange(
    id: string,
    field: 'alt' | 'caption' | 'altFr' | 'captionFr',
    value: string,
  ) {
    setTextMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY), [field]: value },
    }))
  }

  function handleRoomChange(id: string, value: string) {
    const roomNumber = value === '' ? null : Number(value)
    setTextMap((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY), roomNumber } }))
  }

  /**
   * Translate one photo's French into the English the site publishes.
   *
   * Both texts go in a single call: they are two short strings, and one round
   * trip is faster than two. An empty French field is left alone rather than
   * translated into nothing, so a half-filled card does not lose its English.
   *
   * Failures surface. The same button elsewhere in the admin swallowed them
   * silently, and the operator was left staring at an unchanged field with no
   * idea whether the call had even happened.
   */
  function handleTranslate(id: string) {
    const t = textMap[id]
    if (!t) return
    const wanted: Array<'caption' | 'alt'> = []
    if (t.captionFr.trim()) wanted.push('caption')
    if (t.altFr.trim()) wanted.push('alt')
    if (wanted.length === 0) {
      setTranslateError('Écris d’abord le texte en français.')
      return
    }
    setTranslateError(null)
    setTranslating(id)
    startTransition(async () => {
      try {
        const out = await translateBatch(
          wanted.map((f) => (f === 'caption' ? t.captionFr : t.altFr)),
        )
        setTextMap((prev) => {
          const cur = prev[id] ?? EMPTY
          const next = { ...cur }
          wanted.forEach((f, i) => {
            if (out[i]) next[f] = out[i]
          })
          return { ...prev, [id]: next }
        })
      } catch {
        setTranslateError(
          'La traduction a échoué. Recharge la page puis réessaie : après un déploiement, un onglet resté ouvert ne peut plus appeler le serveur.',
        )
      } finally {
        setTranslating(null)
      }
    })
  }

  /** Same thing across every photo whose French is filled and English is not. */
  function handleTranslateAll() {
    const targets = live.filter((i) => {
      const t = textMap[i.id]
      return t && (t.captionFr.trim() || t.altFr.trim())
    })
    if (targets.length === 0) {
      setTranslateError('Aucun texte français à traduire.')
      return
    }
    setTranslateError(null)
    setTranslating('all')
    startTransition(async () => {
      try {
        // One flat call for the whole screen, then split the answers back out.
        const jobs: Array<{ id: string; field: 'caption' | 'alt'; text: string }> = []
        for (const i of targets) {
          const t = textMap[i.id]
          if (t.captionFr.trim()) jobs.push({ id: i.id, field: 'caption', text: t.captionFr })
          if (t.altFr.trim()) jobs.push({ id: i.id, field: 'alt', text: t.altFr })
        }
        const out = await translateBatch(jobs.map((j) => j.text))
        setTextMap((prev) => {
          const next = { ...prev }
          jobs.forEach((j, idx) => {
            if (!out[idx]) return
            next[j.id] = { ...(next[j.id] ?? EMPTY), [j.field]: out[idx] }
          })
          return next
        })
      } catch {
        setTranslateError('La traduction a échoué. Recharge la page puis réessaie.')
      } finally {
        setTranslating(null)
      }
    })
  }

  /* ---- Drag and drop ------------------------------------------------------
     Native HTML5 drag events rather than a library: the whole interaction is
     four handlers and one array move, and a dependency would be more code to
     carry than the feature. */

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setOverId(null)
      return
    }
    setOrder((prev) => {
      const next = prev.filter((id) => id !== dragId)
      const at = next.indexOf(targetId)
      next.splice(at, 0, dragId)
      return next
    })
    setDragId(null)
    setOverId(null)
  }

  function handleTrash(id: string) {
    startTransition(async () => {
      await trashGalleryItem(id)
      const now = new Date().toISOString()
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, deleted_at: now } : i)))
    })
  }

  function handleRestore(id: string) {
    startTransition(async () => {
      await restoreGalleryItem(id)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, deleted_at: null } : i)))
    })
  }

  function handlePermanentDelete(id: string, imageUrl: string) {
    if (!confirm('Supprimer DÉFINITIVEMENT cette photo ? Le fichier sera effacé et irrécupérable.')) return
    startTransition(async () => {
      await deleteGalleryItemPermanently(id, imageUrl)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  function handleSave() {
    // Position in the dragged order is the source of truth; anything not in
    // it (a photo added since load) keeps its stored number.
    const sortUpdates = live.map((i) => {
      const at = order.indexOf(i.id)
      return { id: i.id, sort_order: at === -1 ? i.sort_order : at }
    })
    const texts = live.map((i) => {
      const t = textMap[i.id] ?? textStateOf(i)
      return {
        id: i.id,
        alt: t.alt,
        caption: t.caption,
        altFr: t.altFr,
        captionFr: t.captionFr,
        // A room only means something for a bedroom photo.
        roomNumber: i.category === 'bedrooms' ? t.roomNumber : null,
      }
    })
    setSavedNotice(false)
    startTransition(async () => {
      await updateGalleryOrder(sortUpdates)
      await updateGalleryText(texts)
      setItems((prev) =>
        prev.map((i) => {
          const t = textMap[i.id]
          if (!t) return i
          return {
            ...i,
            alt: t.alt.trim(),
            caption: t.caption.trim(),
            room_number: i.category === 'bedrooms' ? t.roomNumber : null,
            translations: { alt: t.altFr.trim(), caption: t.captionFr.trim() },
            sort_order: order.indexOf(i.id) === -1 ? i.sort_order : order.indexOf(i.id),
          }
        }),
      )
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 3000)
    })
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Galerie</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">{live.length} photos</p>
        </div>
      </div>

      {/* Upload form */}
      <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-semibold text-midnight">Téléverser des photos</h2>
        {uploadError && (
          <p className="mb-4 rounded-xl border border-coral/20 bg-coral/5 px-4 py-2 font-sans text-sm text-coral">
            {uploadError}
          </p>
        )}
        <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
              Catégorie
            </label>
            <select
              name="category"
              required
              className="h-12 rounded-lg border border-lagoon/20 bg-pearl px-3 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
              Texte alternatif (alt) <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              name="alt"
              required
              placeholder="Vue aérienne de la piscine de la villa"
              className="flex h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
              Image <span className="text-coral">*</span>
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="h-12 rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? 'Téléversement…' : 'Téléverser'}
          </Button>
        </form>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={`rounded-full border px-3 py-1 font-sans text-xs font-medium transition-colors ${
            filterCat === 'all'
              ? 'border-midnight bg-midnight text-pearl'
              : 'border-pearl-400 bg-white text-midnight hover:border-midnight'
          }`}
        >
          Toutes ({live.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = live.filter((i) => i.category === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-full border px-3 py-1 font-sans text-xs font-medium transition-colors ${
                filterCat === cat
                  ? 'border-midnight bg-midnight text-pearl'
                  : 'border-pearl-400 bg-white text-midnight hover:border-midnight'
              }`}
            >
              {CATEGORY_LABEL[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">Aucune photo pour le moment.</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">Téléverse ta première photo ci-dessus.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ordered.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => {
                  setDragId(null)
                  setOverId(null)
                }}
                onDragOver={(e) => {
                  // Without preventDefault the browser refuses the drop.
                  e.preventDefault()
                  if (overId !== item.id) setOverId(item.id)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(item.id)
                }}
                className={
                  'group overflow-hidden rounded-xl border bg-white shadow-sm transition ' +
                  (dragId === item.id
                    ? 'opacity-40 border-gold'
                    : overId === item.id
                      ? 'border-gold ring-2 ring-gold/40'
                      : 'border-pearl-400')
                }
              >
                <div className="relative h-36 w-full cursor-grab overflow-hidden bg-pearl-300 active:cursor-grabbing">
                  <Image
                    src={item.image_url}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-2 top-2 rounded-md bg-midnight/70 px-1.5 py-0.5 font-sans text-[10px] font-medium text-pearl opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Glisser pour déplacer
                  </span>
                  <span className="absolute right-2 top-2 rounded-md bg-midnight/70 px-1.5 py-0.5 font-sans text-[10px] font-medium text-pearl">
                    {order.indexOf(item.id) === -1 ? '?' : order.indexOf(item.id) + 1}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <Badge variant={CATEGORY_VARIANT[item.category]} size="sm">
                    {CATEGORY_LABEL[item.category]}
                  </Badge>

                  {item.category === 'bedrooms' ? (
                    <div>
                      <label
                        htmlFor={`room-${item.id}`}
                        className="font-sans text-[11px] font-medium text-midnight-400"
                      >
                        Quelle chambre
                      </label>
                      <select
                        id={`room-${item.id}`}
                        value={textMap[item.id]?.roomNumber ?? ''}
                        onChange={(e) => handleRoomChange(item.id, e.target.value)}
                        className="mt-1 w-full rounded-md border border-pearl-400 bg-pearl px-2 py-1 font-sans text-xs text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                      >
                        <option value="">Non précisée</option>
                        {ROOMS.map((n) => (
                          <option key={n} value={n}>
                            Chambre {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className="font-sans text-[11px] font-medium text-midnight-400">
                      Description, anglais (affichée sur le site)
                    </label>
                    <textarea
                      rows={2}
                      value={textMap[item.id]?.caption ?? ''}
                      onChange={(e) => handleTextChange(item.id, 'caption', e.target.value)}
                      placeholder="Vide : le texte alternatif est affiché à la place"
                      className="mt-1 w-full rounded-md border border-gold-300 bg-gold-50/50 px-2 py-1 font-sans text-xs text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                    />
                    <label className="mt-1.5 block font-sans text-[11px] font-medium text-midnight-400">
                      Description, français
                    </label>
                    <textarea
                      rows={2}
                      value={textMap[item.id]?.captionFr ?? ''}
                      onChange={(e) => handleTextChange(item.id, 'captionFr', e.target.value)}
                      placeholder="Traduction, non publiée"
                      className="mt-1 w-full rounded-md border border-midnight-200 bg-midnight-50/50 px-2 py-1 font-sans text-xs text-midnight placeholder:text-midnight-300 focus:border-midnight-400 focus:outline-none focus:ring-1 focus:ring-midnight-300"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[11px] font-medium text-midnight-400">
                      Texte alternatif, anglais (accessibilité)
                    </label>
                    <textarea
                      rows={2}
                      value={textMap[item.id]?.alt ?? ''}
                      onChange={(e) => handleTextChange(item.id, 'alt', e.target.value)}
                      className="mt-1 w-full rounded-md border border-gold-300 bg-gold-50/50 px-2 py-1 font-sans text-xs text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                    />
                    <label className="mt-1.5 block font-sans text-[11px] font-medium text-midnight-400">
                      Texte alternatif, français
                    </label>
                    <textarea
                      rows={2}
                      value={textMap[item.id]?.altFr ?? ''}
                      onChange={(e) => handleTextChange(item.id, 'altFr', e.target.value)}
                      placeholder="Traduction, non publiée"
                      className="mt-1 w-full rounded-md border border-midnight-200 bg-midnight-50/50 px-2 py-1 font-sans text-xs text-midnight placeholder:text-midnight-300 focus:border-midnight-400 focus:outline-none focus:ring-1 focus:ring-midnight-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTranslate(item.id)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-gold/50 bg-gold/15 py-1 font-sans text-xs font-semibold text-gold-700 transition-colors hover:bg-gold/25 disabled:opacity-50"
                  >
                    {translating === item.id ? 'Traduction…' : 'Traduire FR → EN'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTrash(item.id)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-coral/20 bg-coral/5 py-1 font-sans text-xs font-medium text-coral transition-colors hover:bg-coral/10 disabled:opacity-50"
                  >
                    Mettre à la corbeille
                  </button>
                </div>
              </div>
            ))}
          </div>
          {translateError ? (
            <p
              role="alert"
              className="rounded-xl border border-coral/30 bg-coral/5 px-4 py-2.5 font-sans text-sm text-coral"
            >
              {translateError}
            </p>
          ) : null}

          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-pearl-400 bg-pearl/80 py-3 backdrop-blur">
            <span className="mr-auto font-sans text-xs text-midnight-400">
              La traduction remplit l’anglais à partir du français. Elle ne
              s’enregistre pas toute seule.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTranslateAll}
              disabled={isPending}
            >
              {translating === 'all' ? 'Traduction…' : 'Tout traduire FR → EN'}
            </Button>
            {savedNotice ? (
              <span className="font-sans text-xs text-leaf">
                Enregistré. Les descriptions sont en ligne.
              </span>
            ) : null}
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Enregistrement…' : 'Enregistrer les descriptions et l\'ordre'}
            </Button>
          </div>
        </>
      )}

      {/* Trash */}
      {trashed.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-pearl-400 bg-pearl/40 p-6">
          <div>
            <h2 className="font-heading text-base font-semibold text-midnight">
              Corbeille ({trashed.length})
            </h2>
            <p className="mt-1 font-sans text-xs text-midnight-400">
              Photos masquées du site. Restaure-les, ou supprime-les définitivement (le fichier
              sera alors effacé du stockage et irrécupérable).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trashed.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-pearl-400 bg-white shadow-sm"
              >
                <div className="relative h-36 w-full overflow-hidden bg-pearl-300">
                  <Image
                    src={item.image_url}
                    alt={item.alt}
                    fill
                    className="object-cover opacity-60 grayscale"
                    sizes="200px"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <Badge variant={CATEGORY_VARIANT[item.category]} size="sm">
                    {CATEGORY_LABEL[item.category]}
                  </Badge>
                  <p className="font-sans text-xs text-midnight-400 line-clamp-1">{item.alt}</p>
                  <button
                    type="button"
                    onClick={() => handleRestore(item.id)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-leaf/30 bg-leaf/5 py-1 font-sans text-xs font-medium text-leaf transition-colors hover:bg-leaf/10 disabled:opacity-50"
                  >
                    Restaurer
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(item.id, item.image_url)}
                    disabled={isPending}
                    className="w-full rounded-lg border border-coral/30 bg-coral/10 py-1 font-sans text-xs font-medium text-coral transition-colors hover:bg-coral/20 disabled:opacity-50"
                  >
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
