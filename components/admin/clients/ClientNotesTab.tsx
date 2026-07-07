import { StickyNote } from 'lucide-react'

import type { CustomerNote } from '@/lib/supabase/types'

import { NoteComposer } from './NoteComposer'
import { NoteItem } from './NoteItem'

interface ClientNotesTabProps {
  customerId: string
  notes: (CustomerNote & { author_name?: string | null })[]
}

export function ClientNotesTab({ customerId, notes }: ClientNotesTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <NoteComposer customerId={customerId} />

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <StickyNote className="mx-auto h-8 w-8 text-midnight-400" aria-hidden="true" />
          <p className="mt-3 font-heading text-lg text-midnight-400">
            Aucune note pour l&apos;instant
          </p>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Utilisez le champ ci-dessus pour ajouter votre première note privée.
          </p>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l-2 border-pearl-400 pl-6">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} customerId={customerId} />
          ))}
        </ol>
      )}
    </div>
  )
}
