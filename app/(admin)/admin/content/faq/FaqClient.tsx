'use client'

import { useState, useTransition } from 'react'
import { ToggleSwitch } from '@/components/admin/ToggleSwitch'
import { Button } from '@/components/ui/Button'
import type { FAQ, FaqCategory } from '@/lib/supabase/types'
import { createFAQ, updateFAQ, deleteFAQ } from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// FaqClient — fully client-side inline editing for FAQs
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: FaqCategory[] = ['booking', 'villa', 'tahiti', 'payment', 'experiences']

type EditableRow = FAQ & { _dirty?: boolean; _new?: boolean }

type Props = { initialFaqs: FAQ[] }

export function FaqClient({ initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<EditableRow[]>(initialFaqs)
  const [isPending, startTransition] = useTransition()
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({})

  function grouped(): Record<FaqCategory, EditableRow[]> {
    const result = CATEGORIES.reduce<Record<FaqCategory, EditableRow[]>>(
      (acc, c) => {
        acc[c] = []
        return acc
      },
      {} as Record<FaqCategory, EditableRow[]>,
    )
    faqs.forEach((f) => {
      result[f.category]?.push(f)
    })
    return result
  }

  function patchLocal(id: string, patch: Partial<EditableRow>) {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch, _dirty: true } : f)),
    )
  }

  function handleSave(faq: EditableRow) {
    startTransition(async () => {
      try {
        if (faq._new) {
          await createFAQ({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            sort_order: faq.sort_order,
            active: faq.active,
          })
          // Mark as saved
          setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, _new: false, _dirty: false } : f)))
        } else {
          await updateFAQ(faq.id, {
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order,
            active: faq.active,
          })
          setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, _dirty: false } : f)))
        }
        setSaveErrors((prev) => {
          const next = { ...prev }
          delete next[faq.id]
          return next
        })
      } catch (err) {
        setSaveErrors((prev) => ({
          ...prev,
          [faq.id]: err instanceof Error ? err.message : 'Save failed',
        }))
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this FAQ permanently?')) return
    startTransition(async () => {
      await deleteFAQ(id)
      setFaqs((prev) => prev.filter((f) => f.id !== id))
    })
  }

  function handleAddNew(category: FaqCategory) {
    const existing = faqs.filter((f) => f.category === category)
    const maxOrder = existing.reduce((m, f) => Math.max(m, f.sort_order), 0)
    const tmpId = `new-${Date.now()}`
    setFaqs((prev) => [
      ...prev,
      {
        id: tmpId,
        question: '',
        answer: '',
        category,
        sort_order: maxOrder + 1,
        active: true,
        created_at: new Date().toISOString(),
        _new: true,
        _dirty: true,
      },
    ])
  }

  const groups = grouped()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-midnight">FAQ</h1>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          {faqs.length} questions — edit inline, save per row
        </p>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold capitalize text-midnight">{cat}</h2>
            <button
              type="button"
              onClick={() => handleAddNew(cat)}
              className="flex items-center gap-1 rounded-lg border border-pearl-400 bg-white px-3 py-1.5 font-sans text-xs font-medium text-midnight transition-colors hover:border-gold hover:text-gold"
            >
              + Add
            </button>
          </div>

          {groups[cat].length === 0 ? (
            <p className="font-sans text-sm italic text-midnight-300">
              No FAQs in this category yet.
            </p>
          ) : (
            <div className="space-y-3">
              {groups[cat].map((faq) => (
                <div
                  key={faq.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    faq._dirty ? 'border-gold/40' : 'border-pearl-400'
                  }`}
                >
                  {saveErrors[faq.id] && (
                    <p className="mb-2 font-sans text-xs text-coral">{saveErrors[faq.id]}</p>
                  )}
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block font-sans text-xs font-medium text-midnight-400">
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => patchLocal(faq.id, { question: e.target.value })}
                        placeholder="What is the check-in time?"
                        className="w-full rounded-lg border border-lagoon/20 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-sans text-xs font-medium text-midnight-400">
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => patchLocal(faq.id, { answer: e.target.value })}
                        placeholder="Check-in is between 3pm and 8pm."
                        className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-3 py-2 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="font-sans text-xs text-midnight-400">Order</label>
                        <input
                          type="number"
                          value={faq.sort_order}
                          onChange={(e) =>
                            patchLocal(faq.id, { sort_order: parseInt(e.target.value, 10) })
                          }
                          className="w-16 rounded-md border border-pearl-400 bg-pearl px-2 py-1 font-sans text-xs text-midnight focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-midnight-400">Active</span>
                        <ToggleSwitch
                          checked={faq.active}
                          onToggle={async () => {
                            patchLocal(faq.id, { active: !faq.active })
                          }}
                        />
                      </div>
                      <div className="ml-auto flex gap-2">
                        {faq._dirty && (
                          <Button
                            size="sm"
                            disabled={isPending || !faq.question || !faq.answer}
                            onClick={() => handleSave(faq)}
                          >
                            Save
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(faq.id)}
                          disabled={isPending}
                          className="rounded-lg border border-coral/20 bg-coral/5 px-3 py-1.5 font-sans text-xs font-medium text-coral transition-colors hover:bg-coral/10 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
