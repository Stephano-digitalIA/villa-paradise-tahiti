'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

import { assignTag, createTag, removeTag } from '@/app/actions/clients'
import type { CustomerTag, CustomerTagColor } from '@/lib/supabase/types'

interface TagEditorProps {
  customerId: string
  /** Labels assignés au client (depuis customer_summary.tags). */
  assignedLabels: string[]
  /** Catalogue complet des tags. */
  allTags: CustomerTag[]
}

const COLOR_OPTIONS: { value: CustomerTagColor; ring: string; chip: string }[] = [
  { value: 'gold',     ring: 'bg-gold',     chip: 'bg-gold/15 text-midnight' },
  { value: 'coral',    ring: 'bg-coral',    chip: 'bg-coral/15 text-coral' },
  { value: 'lagoon',   ring: 'bg-lagoon',   chip: 'bg-lagoon/15 text-lagoon' },
  { value: 'leaf',     ring: 'bg-leaf',     chip: 'bg-leaf/15 text-leaf' },
  { value: 'midnight', ring: 'bg-midnight', chip: 'bg-midnight/15 text-midnight' },
  { value: 'sand',     ring: 'bg-sand',     chip: 'bg-sand text-midnight' },
]

const COLOR_CHIP: Record<CustomerTagColor, string> = COLOR_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.chip }),
  {} as Record<CustomerTagColor, string>,
)

export function TagEditor({ customerId, assignedLabels, allTags }: TagEditorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)

  const assignedSet = new Set(assignedLabels)
  const assignedTags = allTags.filter((t) => assignedSet.has(t.label))
  const unassignedTags = allTags.filter((t) => !assignedSet.has(t.label))

  // Close popover on outside click / Escape
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function handleAssign(tagId: string) {
    setError(null)
    startTransition(async () => {
      const res = await assignTag(customerId, tagId)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  function handleRemove(tagId: string) {
    setError(null)
    startTransition(async () => {
      const res = await removeTag(customerId, tagId)
      if (!res.ok) {
        setError(res.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
          Tags
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {assignedTags.map((tag) => (
          <span
            key={tag.id}
            className={
              'group inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ' +
              (COLOR_CHIP[tag.color] ?? 'bg-pearl-300 text-midnight-400')
            }
          >
            {tag.label}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              disabled={pending}
              aria-label={`Remove tag ${tag.label}`}
              className="rounded-full p-0.5 transition-colors hover:bg-midnight/10 disabled:opacity-40"
            >
              <X className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
          </span>
        ))}

        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={pending}
            aria-expanded={open}
            aria-haspopup="true"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-pearl-400 px-2.5 py-0.5 font-sans text-xs font-medium text-midnight-400 transition-colors hover:border-midnight hover:text-midnight disabled:opacity-50"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add tag
          </button>

          {open ? (
            <TagPopover
              unassignedTags={unassignedTags}
              pending={pending}
              onPick={(tagId) => {
                setOpen(false)
                handleAssign(tagId)
              }}
              onCreated={(tagId) => {
                setOpen(false)
                handleAssign(tagId)
              }}
            />
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="font-sans text-xs text-coral">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────── */

interface TagPopoverProps {
  unassignedTags: CustomerTag[]
  pending: boolean
  onPick: (tagId: string) => void
  onCreated: (tagId: string) => void
}

function TagPopover({ unassignedTags, pending, onPick, onCreated }: TagPopoverProps) {
  const [query, setQuery] = useState('')
  const [color, setColor] = useState<CustomerTagColor>('gold')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = unassignedTags.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase().trim()),
  )
  const exactMatch = unassignedTags.find(
    (t) => t.label.toLowerCase() === query.toLowerCase().trim(),
  )
  const canCreate = query.trim().length > 0 && !exactMatch

  async function handleCreate() {
    if (!canCreate || creating) return
    setCreating(true)
    setError(null)
    const res = await createTag(query.trim(), color)
    setCreating(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    if (res.data) onCreated(res.data.id)
  }

  return (
    <div
      role="menu"
      className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-pearl-400 bg-white shadow-elevated"
    >
      <div className="border-b border-pearl-400 p-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or create a tag…"
          className="w-full rounded-lg border border-pearl-400 bg-white px-2.5 py-1.5 font-sans text-sm text-midnight focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {filtered.length > 0 ? (
        <ul className="max-h-48 overflow-y-auto py-1">
          {filtered.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => onPick(tag.id)}
                disabled={pending}
                className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left font-sans text-sm text-midnight transition-colors hover:bg-pearl-300/40 disabled:opacity-50"
              >
                <span
                  className={
                    'inline-flex rounded-full px-2 py-0.5 font-sans text-xs font-medium ' +
                    (COLOR_CHIP[tag.color] ?? 'bg-pearl-300 text-midnight-400')
                  }
                >
                  {tag.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {canCreate ? (
        <div className="border-t border-pearl-400 p-2">
          <p className="mb-1.5 font-sans text-[10px] uppercase tracking-wider text-midnight-400">
            Create new tag
          </p>
          <div className="mb-2 flex flex-wrap gap-1">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={`Color ${c.value}`}
                aria-pressed={color === c.value}
                className={
                  'h-5 w-5 rounded-full transition-transform ' +
                  c.ring +
                  (color === c.value ? ' ring-2 ring-offset-1 ring-midnight scale-110' : ' opacity-70 hover:opacity-100')
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || pending}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-midnight px-3 py-1.5 font-sans text-xs font-semibold text-pearl hover:bg-midnight/90 disabled:cursor-not-allowed disabled:bg-midnight/40"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {creating ? 'Creating…' : `Create "${query.trim()}"`}
          </button>
          {error ? (
            <p role="alert" className="mt-1.5 font-sans text-xs text-coral">
              {error}
            </p>
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-3 py-3 text-center font-sans text-xs italic text-midnight-400">
          {query.trim() ? 'No match.' : 'No tag available. Type to create one.'}
        </p>
      ) : null}
    </div>
  )
}
