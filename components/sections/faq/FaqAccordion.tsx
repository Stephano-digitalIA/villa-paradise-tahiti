'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { PortableTextRenderer } from '@/components/sections/_shared/PortableTextRenderer'
import { cn } from '@/lib/utils'
import type { FAQ } from '@/lib/sanity'

interface FaqAccordionProps {
  /** All FAQ items inside a single category — assumed already sorted by `order`. */
  faqs: FAQ[]
}

/**
 * FaqAccordion — keyboard-accessible single-category accordion.
 *
 * Implementation choice: hand-rolled (vs `<details>` / Radix) so we keep
 * full control of the animation, the chevron rotation and the aria
 * wiring. Each item exposes `aria-expanded` on its trigger and
 * `aria-labelledby` on the panel, matching the WAI-ARIA disclosure
 * pattern (we don't pretend to be a tablist).
 *
 * Multiple items can be open at once — that's deliberate. Guests
 * often skim FAQs and an exclusive accordion fights that flow.
 */
export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ul className="divide-y divide-pearl-400 overflow-hidden rounded-2xl border border-pearl-400 bg-pearl shadow-soft">
      {faqs.map((faq) => (
        <FaqItem
          key={faq._id}
          faq={faq}
          isOpen={openIds.has(faq._id)}
          onToggle={() => toggle(faq._id)}
        />
      ))}
    </ul>
  )
}

interface FaqItemProps {
  faq: FAQ
  isOpen: boolean
  onToggle: () => void
}

function FaqItem({ faq, isOpen, onToggle }: FaqItemProps) {
  const panelId = useId()
  const triggerId = useId()

  return (
    <li>
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between gap-6 px-6 py-5 text-left',
          'transition-colors duration-200',
          'hover:bg-sand/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold',
        )}
      >
        <span className="font-heading text-body-lg font-medium leading-snug text-midnight">
          {faq.question}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-5 w-5 shrink-0 text-gold transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="px-6 pb-6 pt-1"
      >
        <PortableTextRenderer value={faq.answer} prose={false} className="text-sm text-midnight/80" />
      </div>
    </li>
  )
}
