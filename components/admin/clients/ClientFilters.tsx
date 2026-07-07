'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import type { AcquisitionSource, CustomerTag } from '@/lib/supabase/types'

const SOURCE_LABELS: Record<AcquisitionSource, string> = {
  direct: 'Direct',
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  vrbo: 'VRBO',
  referral: 'Recommandation',
  manual: 'Manuel',
  imported: 'Importé',
}

interface ClientFiltersProps {
  tags: CustomerTag[]
}

/**
 * URL-state filters for the clients list.
 *
 * Mirrors the search params on the server: `q`, `tag`, `source`.
 * Submitting the form (or clicking a chip) navigates to a new URL — the
 * server re-fetches.
 */
export function ClientFilters({ tags }: ClientFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const activeTag = params.get('tag') ?? ''
  const activeSource = params.get('source') ?? ''

  // Keep input in sync when navigating back/forward
  useEffect(() => {
    setQ(params.get('q') ?? '')
  }, [params])

  function buildHref(next: Record<string, string | null>): string {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '') sp.delete(k)
      else sp.set(k, v)
    }
    sp.delete('page')
    const qs = sp.toString()
    return qs ? `/admin/clients?${qs}` : '/admin/clients'
  }

  function navigate(href: string) {
    startTransition(() => router.push(href))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    navigate(buildHref({ q: q.trim() || null }))
  }

  const hasActiveFilters = q || activeTag || activeSource

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher nom, e-mail, téléphone…"
            className="w-full rounded-xl border border-pearl-400 bg-white py-2.5 pl-9 pr-3 font-sans text-sm text-midnight placeholder:text-midnight-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        <select
          value={activeSource}
          onChange={(e) => navigate(buildHref({ source: e.target.value || null }))}
          className="rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          aria-label="Filtrer par source"
        >
          <option value="">Toutes les sources</option>
          {(Object.keys(SOURCE_LABELS) as AcquisitionSource[]).map((src) => (
            <option key={src} value={src}>
              {SOURCE_LABELS[src]}
            </option>
          ))}
        </select>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm font-medium text-midnight-400 transition-colors hover:border-midnight hover:text-midnight"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Réinitialiser les filtres
          </button>
        ) : null}

        {isPending ? (
          <span className="font-sans text-xs text-midnight-400">Mise à jour…</span>
        ) : null}
      </form>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs uppercase tracking-wider text-midnight-400">
            Tags:
          </span>
          {tags.map((tag) => {
            const isActive = tag.label === activeTag
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  navigate(buildHref({ tag: isActive ? null : tag.label }))
                }
                className={
                  'inline-flex items-center rounded-full border px-3 py-1 font-sans text-xs font-medium transition-colors ' +
                  (isActive
                    ? 'border-gold bg-gold/10 text-midnight'
                    : 'border-pearl-400 bg-white text-midnight-400 hover:border-midnight hover:text-midnight')
                }
              >
                {tag.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
