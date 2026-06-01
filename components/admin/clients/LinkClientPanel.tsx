'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, Plus, Search } from 'lucide-react'

import {
  linkReservationToCustomer,
  searchCustomers,
  type CustomerSearchResult,
} from '@/app/actions/clients'

import { NewClientDrawer } from './NewClientDrawer'

interface LinkClientPanelProps {
  reservationId: string
  /** Source to attach to a newly-created client (e.g. 'airbnb' if reservation came from iCal). */
  acquisitionSource?:
    | 'direct'
    | 'airbnb'
    | 'booking'
    | 'vrbo'
    | 'referral'
    | 'manual'
    | 'imported'
}

/**
 * Shown inside the "Guest Information" card of a reservation when no customer is linked.
 * Lets the admin search the existing CRM or create a new client + link in one go.
 */
export function LinkClientPanel({
  reservationId,
  acquisitionSource = 'manual',
}: LinkClientPanelProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Debounced search
  useEffect(() => {
    const needle = query.trim()
    if (!needle) {
      setResults([])
      return
    }
    let cancelled = false
    setSearching(true)
    const timer = window.setTimeout(async () => {
      const res = await searchCustomers(needle, 8)
      if (cancelled) return
      setSearching(false)
      if (res.ok) setResults(res.data!)
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  function handleLink(customerId: string) {
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await linkReservationToCustomer(reservationId, customerId)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  function handleCreated(customerId: string) {
    handleLink(customerId)
  }

  return (
    <>
      <div className="mt-4 rounded-xl border border-dashed border-pearl-400 bg-pearl-300/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-midnight-400" aria-hidden="true" />
          <p className="font-sans text-sm font-medium text-midnight">
            Link this reservation to a client
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-midnight-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={pending}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-pearl-400 bg-white py-2 pl-9 pr-3 font-sans text-sm text-midnight placeholder:text-midnight-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
          />
        </div>

        {query.trim() ? (
          <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-pearl-400 bg-white shadow-sm">
            {searching ? (
              <li className="px-3 py-3 font-sans text-xs text-midnight-400">
                Searching…
              </li>
            ) : results.length === 0 ? (
              <li className="px-3 py-3 font-sans text-xs text-midnight-400">
                No match. Create a new client below.
              </li>
            ) : (
              results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleLink(c.id)}
                    disabled={pending}
                    className="flex w-full items-center justify-between gap-2 border-b border-pearl-400 px-3 py-2 text-left transition-colors last:border-0 hover:bg-pearl-300/40 disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block font-sans text-sm font-medium text-midnight truncate">
                        {c.first_name} {c.last_name}
                      </span>
                      <span className="block font-sans text-xs text-midnight-400 truncate">
                        {c.email}
                      </span>
                    </span>
                    <span className="font-sans text-xs font-medium text-gold">
                      Link →
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-sans text-xs text-midnight-400">
            Not in the CRM yet?
          </p>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-pearl-400 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-midnight transition-colors hover:border-midnight"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            New client
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-2 rounded-lg border border-coral/30 bg-coral/10 p-2 font-sans text-xs text-coral"
          >
            {error}
          </p>
        ) : null}
      </div>

      <NewClientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
        acquisitionSource={acquisitionSource}
      />
    </>
  )
}
