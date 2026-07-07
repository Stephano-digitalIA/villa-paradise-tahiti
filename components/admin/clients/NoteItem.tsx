'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, Trash2, X } from 'lucide-react'

import { deleteNote, updateNote } from '@/app/actions/clients'
import type { CustomerNote } from '@/lib/supabase/types'

interface NoteItemProps {
  note: CustomerNote & { author_name?: string | null }
  customerId: string
}

export function NoteItem({ note, customerId }: NoteItemProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note.body)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function startEdit() {
    setDraft(note.body)
    setError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setError(null)
  }

  function handleSave() {
    if (!draft.trim() || pending) return
    setError(null)
    startTransition(async () => {
      const res = await updateNote(note.id, customerId, draft)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setIsEditing(false)
      router.refresh()
    })
  }

  function handleDelete() {
    if (pending) return
    setError(null)
    startTransition(async () => {
      const res = await deleteNote(note.id, customerId)
      if (!res.ok) {
        setError(res.error)
        setConfirmDelete(false)
        return
      }
      router.refresh()
    })
  }

  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-white"
      />
      <div className="rounded-2xl border border-pearl-400 bg-white p-4 shadow-sm">
        <header className="flex items-center justify-between gap-2">
          <p className="font-sans text-xs font-semibold text-midnight-400">
            {note.author_name ?? 'Inconnu'}
          </p>
          <div className="flex items-center gap-2">
            <time
              dateTime={note.created_at}
              className="font-sans text-xs text-midnight-400"
            >
              {formatDateTime(note.created_at)}
            </time>
            {!isEditing && !confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  disabled={pending}
                  aria-label="Modifier la note"
                  className="rounded-md p-1 text-midnight-400 transition-colors hover:bg-pearl-300/60 hover:text-midnight"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={pending}
                  aria-label="Supprimer la note"
                  className="rounded-md p-1 text-midnight-400 transition-colors hover:bg-coral/10 hover:text-coral"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </header>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={pending}
              maxLength={4000}
              className="w-full resize-y rounded-lg border border-pearl-400 bg-white px-3 py-2 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-pearl-400 px-3 py-1.5 font-sans text-xs font-medium text-midnight-400 hover:border-midnight hover:text-midnight"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={pending || !draft.trim() || draft === note.body}
                className="inline-flex items-center gap-1.5 rounded-lg bg-midnight px-3 py-1.5 font-sans text-xs font-semibold text-pearl hover:bg-midnight/90 disabled:cursor-not-allowed disabled:bg-midnight/40"
              >
                <Check className="h-3 w-3" aria-hidden="true" />
                {pending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : confirmDelete ? (
          <div className="mt-2 rounded-lg border border-coral/30 bg-coral/5 p-3">
            <p className="font-sans text-sm text-midnight">
              Supprimer définitivement cette note ?
            </p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-pearl-400 px-3 py-1.5 font-sans text-xs font-medium text-midnight-400 hover:border-midnight hover:text-midnight"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-coral px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                {pending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-midnight">
            {note.body}
          </p>
        )}

        {!isEditing && !confirmDelete && note.updated_at !== note.created_at ? (
          <p className="mt-1.5 font-sans text-[10px] italic text-midnight-400">
Modifié le {formatDateTime(note.updated_at)}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-2 font-sans text-xs text-coral">
            {error}
          </p>
        ) : null}
      </div>
    </li>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
