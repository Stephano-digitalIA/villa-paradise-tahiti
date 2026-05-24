import { Search } from 'lucide-react'

import { Container, Section } from '@/components/ui'

/**
 * FaqHero — page intro with a (UI-only) search field.
 *
 * The search input has no behaviour yet. It exists for layout stability
 * and to signal to users that FAQ search is a planned affordance.
 * Phase D / E will wire it up — likely an in-memory filter over the
 * already-rendered list.
 */
export function FaqHero() {
  return (
    <Section tone="pearl" spacing="default">
      <Container className="pt-24">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            FAQ
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>

          <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
            Frequently asked
            <span className="block not-italic font-heading font-normal text-gold">
              questions
            </span>
          </h1>

          <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
            Everything we&apos;ve been asked in the past three years, sorted
            by topic. If your question isn&apos;t here, send us a note —
            we reply within the hour during Tahiti daylight.
          </p>

          <form
            className="mt-10 w-full max-w-xl"
            // TODO Phase D — wire to client-side filter over the rendered list.
            action="#"
            method="get"
            role="search"
          >
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
                name="q"
                placeholder="Search by keyword (cancellation, pool, transfer…)"
                className="h-14 w-full rounded-full border border-pearl-500 bg-pearl pl-12 pr-5 font-sans text-body-md text-midnight placeholder:text-midnight-300 shadow-soft focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
          </form>
        </div>
      </Container>
    </Section>
  )
}
