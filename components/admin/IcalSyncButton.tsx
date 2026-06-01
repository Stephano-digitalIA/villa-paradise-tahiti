'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { triggerIcalSync, type IcalSyncResult } from '@/app/actions/ical'

interface IcalSyncButtonProps {
  /** Visual variant — 'solid' for the integrations page, 'outline' for the calendar pill area. */
  variant?: 'solid' | 'outline'
  /** Short label override (defaults to "Sync now"). */
  label?: string
}

/**
 * Manually fires the iCal sync pipeline (Airbnb + Booking.com + VRBO).
 * Reuses the same code path as the hourly Netlify Scheduled Function via
 * the `triggerIcalSync` server action.
 */
export function IcalSyncButton({
  variant = 'solid',
  label = 'Sync now',
}: IcalSyncButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<IcalSyncResult | null>(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const res = await triggerIcalSync()
      setResult(res)
      if (res.ok) router.refresh()
    })
  }

  const isSolid = variant === 'solid'

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={
          'inline-flex items-center gap-2 rounded-xl font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
          (isSolid
            ? 'bg-midnight px-5 py-2.5 text-pearl hover:bg-midnight/90'
            : 'border border-pearl-400 bg-white px-3 py-1.5 text-midnight hover:border-midnight')
        }
      >
        <RefreshCw
          className={'h-3.5 w-3.5 ' + (pending ? 'animate-spin' : '')}
          aria-hidden="true"
        />
        {pending ? 'Synchronisation…' : label}
      </button>

      {result ? (
        <p
          className={
            'max-w-xs text-right font-sans text-xs leading-tight ' +
            (result.ok ? 'text-leaf' : 'text-coral')
          }
        >
          {formatResultMessage(result)}
        </p>
      ) : null}
    </div>
  )
}

function formatResultMessage(result: IcalSyncResult): string {
  if (!result.ok) return result.error

  if (result.mode === 'mock') {
    return `Mode mock — aucune URL iCal configurée. ${result.mergedCount} plages factices chargées.`
  }

  const total =
    result.sources.airbnb + result.sources.booking + result.sources.vrbo
  const persisted = result.persistence
  if (!persisted) return `OK — ${total} plages synchronisées.`

  const parts: string[] = []
  for (const src of ['airbnb', 'booking', 'vrbo'] as const) {
    const p = persisted.perSource[src]
    if (!p) continue
    if (p.upserted === 0 && p.deleted === 0) continue
    parts.push(`${src}: +${p.upserted}/-${p.deleted}`)
  }
  if (parts.length === 0) {
    return `OK — aucune nouveauté. (${persisted.durationMs} ms)`
  }
  return `OK · ${parts.join(' · ')} · ${persisted.durationMs} ms`
}
