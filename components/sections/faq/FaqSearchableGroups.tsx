'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { FaqGroups } from './FaqGroups'
import type { FAQ } from '@/lib/cms'

interface FaqSearchableGroupsProps {
  faqs: FAQ[]
}

/**
 * Everything a visitor might type to find this entry: the published English
 * question and answer, plus the French source when it has been filled in
 * `/admin/content/faq`.
 *
 * The page is English and read in French through the browser's own
 * translation, so a French speaker searches with French words while the data
 * stays English. "acompte" cannot match "deposit". Including the French
 * source closes that gap for every entry that has one; entries left
 * untranslated simply keep matching in English only.
 */
function searchableText(faq: FAQ): string {
  const fr = faq.translations
  return [faq.question, faq.answer, fr?.question, fr?.answer]
    .filter(Boolean)
    .join(' ')
}

/**
 * Lowercase, and drop everything that is not a letter or a digit.
 *
 * Guests type "wifi" where the answer says "Wi-Fi", or "check in" where it
 * reads "check-in". A plain substring match finds neither, and an empty
 * result on a common question reads as a broken search rather than a
 * spelling mismatch. Removing the separators on both sides makes those pairs
 * equal. NFD splits "é" into "e" plus a combining mark, which the same filter
 * then drops, so accents are folded in the one pass.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Search field + filtered FAQ list.
 *
 * The field used to live in `FaqHero` as decoration, with an `action="#"`
 * form and no behaviour: typing did nothing, and pressing Enter reloaded
 * the page. It sits here instead so it can share state with the list.
 *
 * Filtering is a plain in-memory pass. The FAQ is a few dozen entries
 * rendered in full on the page already, so there is nothing to fetch and
 * no index to build.
 *
 * Deliberately NOT deferred. An earlier version ran the query through
 * `useDeferredValue`, which lets React keep showing a stale tree while the
 * next one prepares. With a count derived from the deferred value and a
 * message quoting the live one, the page contradicted itself mid-keystroke:
 * "13 questions found" above "Nothing found for pi". Fourteen entries filter
 * in well under a frame, so there was nothing to defer and the optimisation
 * only bought an inconsistency.
 *
 * `FaqGroups` drops empty categories on its own, so a narrow search
 * naturally collapses the page to the matching sections.
 */
export function FaqSearchableGroups({ faqs }: FaqSearchableGroupsProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = normalize(query)
    if (!needle) return faqs
    return faqs.filter((faq) => normalize(searchableText(faq)).includes(needle))
  }, [faqs, query])

  const searching = query.trim().length > 0

  return (
    <>
      {/* The field belongs with the intro above and the list below, so it
          carries almost no vertical space of its own. */}
      <Section tone="pearl" spacing="none" className="py-2 sm:py-3">
        <Container>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl">
              <label htmlFor="faq-search" className="sr-only">
                Search the FAQ
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-400"
                />
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  // The browser must not offer its own history here. The old
                  // field was named "q", so Chrome proposed everything the
                  // visitor had ever typed into any search box: on the owner's
                  // machine that surfaced unrelated admin paperwork under a
                  // villa FAQ. Guests would see their own history just as
                  // wrongly, and it reads as content of the site.
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Search by keyword (cancellation, pool, transfer…)"
                  className="h-14 w-full rounded-full border border-pearl-500 bg-pearl pl-12 pr-12 font-sans text-body-md text-midnight placeholder:text-midnight-300 shadow-soft focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-midnight-400 transition-colors hover:bg-sand hover:text-midnight focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              {/* Announced to screen readers as the count changes.
                  Silent when nothing matches: the panel below already says
                  so, in full, and quotes the term back. Two lines saying the
                  same thing read as a stutter. */}
              <p
                role="status"
                aria-live="polite"
                className="mt-3 text-center font-sans text-body-sm text-midnight-400"
              >
                {searching && filtered.length > 0
                  ? `${filtered.length} question${filtered.length > 1 ? 's' : ''} found.`
                  : ''}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {filtered.length > 0 ? (
        <FaqGroups faqs={filtered} />
      ) : (
        // Same rhythm as FaqGroups, which this replaces.
        <Section tone="pearl" spacing="tight">
          <Container className="max-w-4xl">
            <div className="rounded-2xl border border-pearl-400 bg-pearl px-8 py-12 text-center">
              <p className="font-heading text-h3-luxe font-medium text-midnight">
                Nothing found for “{query.trim()}”
              </p>
              <p className="mt-3 font-sans text-body-md text-midnight-400">
                Try a broader word, or send us a note below and we will answer
                you personally.
              </p>
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
