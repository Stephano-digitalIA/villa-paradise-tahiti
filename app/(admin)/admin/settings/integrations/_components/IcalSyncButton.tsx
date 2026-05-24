'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function IcalSyncButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    ok: boolean
    message: string
  } | null>(null)

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      try {
        const cronSecret = '' // Client cannot access CRON_SECRET — triggers server route instead
        const res = await fetch('/api/ical/sync', {
          method: 'GET',
          headers: {
            // The server-side secret is read from env on the server
            // For the manual trigger we use a dedicated endpoint that checks admin session
          },
        })

        if (res.ok) {
          const data = await res.json() as { ok: boolean; count: number; sources: string[]; syncedAt: string }
          setResult({
            ok: true,
            message: `Synced ${data.count} blocked date${data.count !== 1 ? 's' : ''}. Sources: ${data.sources.join(', ')}`,
          })
          router.refresh()
        } else {
          const body = await res.json().catch(() => ({}))
          setResult({
            ok: false,
            message: (body as { error?: string }).error ?? `Sync failed (${res.status}). Check CRON_SECRET.`,
          })
        }
      } catch {
        setResult({ ok: false, message: 'Network error. Sync failed.' })
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-midnight px-5 py-2.5 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isPending ? 'animate-spin' : ''}
          aria-hidden="true"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-4.36" />
        </svg>
        {isPending ? 'Syncing...' : 'Trigger Sync Now'}
      </button>
      {result && (
        <p
          className={`font-sans text-xs ${result.ok ? 'text-leaf' : 'text-coral'}`}
        >
          {result.message}
        </p>
      )}
    </div>
  )
}
