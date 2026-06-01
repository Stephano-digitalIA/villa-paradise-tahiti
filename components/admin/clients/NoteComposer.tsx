'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

import { createNote } from '@/app/actions/clients'

interface NoteComposerProps {
  customerId: string
}

export function NoteComposer({ customerId }: NoteComposerProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim() || pending) return
    setError(null)

    startTransition(async () => {
      const res = await createNote(customerId, body)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setBody('')
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-pearl-400 bg-white p-4 shadow-sm"
    >
      <label htmlFor="note-body" className="sr-only">
        New private note
      </label>
      <textarea
        id="note-body"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a private note — preferences, incidents, follow-ups…"
        disabled={pending}
        maxLength={4000}
        className="w-full resize-y rounded-xl border border-pearl-400 bg-white px-3 py-2.5 font-sans text-sm text-midnight placeholder:text-midnight-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-sans text-xs text-midnight-400">
          {body.length}/4000 · only visible to admins
        </p>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-semibold text-pearl shadow-sm transition-colors hover:bg-midnight/90 disabled:cursor-not-allowed disabled:bg-midnight/40"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          {pending ? 'Saving…' : 'Add note'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 font-sans text-xs text-coral">
          {error}
        </p>
      ) : null}
    </form>
  )
}
