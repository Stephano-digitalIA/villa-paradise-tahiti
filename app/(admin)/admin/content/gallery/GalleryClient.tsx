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
} from './actions'

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

type Props = { initialItems: GalleryItem[] }

export function GalleryClient({ initialItems }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [filterCat, setFilterCat] = useState<GalleryCategory | 'all'>('all')
  const [isPending, startTransition] = useTransition()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [orderMap, setOrderMap] = useState<Record<string, number>>(
    Object.fromEntries(initialItems.map((i) => [i.id, i.sort_order])),
  )

  const live = useMemo(() => items.filter((i) => !i.deleted_at), [items])
  const trashed = useMemo(() => items.filter((i) => i.deleted_at), [items])

  const filtered = filterCat === 'all' ? live : live.filter((i) => i.category === filterCat)

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

  function handleOrderChange(id: string, val: string) {
    const n = parseInt(val, 10)
    if (!isNaN(n)) setOrderMap((prev) => ({ ...prev, [id]: n }))
  }

  function handleSaveOrder() {
    const updates = live.map((i) => ({ id: i.id, sort_order: orderMap[i.id] ?? i.sort_order }))
    startTransition(async () => {
      await updateGalleryOrder(updates)
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
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-pearl-400 bg-white shadow-sm"
              >
                <div className="relative h-36 w-full overflow-hidden bg-pearl-300">
                  <Image
                    src={item.image_url}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <Badge variant={CATEGORY_VARIANT[item.category]} size="sm">
                    {CATEGORY_LABEL[item.category]}
                  </Badge>
                  <p className="font-sans text-xs text-midnight-400 line-clamp-1">{item.alt}</p>
                  <div className="flex items-center gap-2">
                    <label className="font-sans text-xs text-midnight-400">Ordre</label>
                    <input
                      type="number"
                      value={orderMap[item.id] ?? item.sort_order}
                      onChange={(e) => handleOrderChange(item.id, e.target.value)}
                      className="w-14 rounded-md border border-pearl-400 bg-pearl px-2 py-1 font-sans text-xs text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                    />
                  </div>
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
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleSaveOrder} disabled={isPending}>
              {isPending ? 'Enregistrement…' : 'Enregistrer l\'ordre'}
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
