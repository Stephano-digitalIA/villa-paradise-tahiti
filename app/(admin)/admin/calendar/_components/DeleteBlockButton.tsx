'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  blockId: string
}

export function DeleteBlockButton({ blockId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/blocked-dates?id=${blockId}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError((body as { error?: string }).error ?? 'Delete failed')
          return
        }
        router.refresh()
      } catch {
        setError('Network error')
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="font-sans text-xs font-medium text-coral hover:underline disabled:opacity-50"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && (
        <p className="mt-1 font-sans text-xs text-coral">{error}</p>
      )}
    </div>
  )
}
