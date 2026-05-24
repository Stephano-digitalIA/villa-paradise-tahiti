'use client'

import { useTransition, useState } from 'react'
import { markInquiryReplied } from '@/app/actions/inquiries'

type Props = {
  inquiryId: string
}

export function InquiriesClient({ inquiryId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (done) {
    return (
      <span className="font-sans text-xs text-leaf">Marked as replied</span>
    )
  }

  function handleMark() {
    setError(null)
    startTransition(async () => {
      const result = await markInquiryReplied(inquiryId)
      if (result.error) {
        setError(result.error)
      } else {
        setDone(true)
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMark}
        disabled={isPending}
        className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight transition-colors hover:border-midnight disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Mark as Replied'}
      </button>
      {error && (
        <p className="mt-1 font-sans text-xs text-coral">{error}</p>
      )}
    </div>
  )
}
