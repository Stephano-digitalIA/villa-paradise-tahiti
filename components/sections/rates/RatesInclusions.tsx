import { Check, Plus } from 'lucide-react'

import { Container, Section } from '@/components/ui'

const INCLUDED: ReadonlyArray<{ title: string; detail: string }> = [
  {
    title: 'Welcome tropical basket',
    detail:
      'Fresh papaya, mango, passionfruit, croissants and vanilla coffee on the counter when you arrive.',
  },
  {
    title: 'Daily housekeeping (on request)',
    detail:
      'Discreet refresh of linens, towels and the kitchen — scheduled to your rhythm.',
  },
  {
    title: 'Private compact car',
    detail:
      'A small island car for the duration of the stay, fuel-efficient and parked at the villa.',
  },
  {
    title: 'Complimentary airport transfer',
    detail:
      'Complimentary transfer by our partner taxi service for the 25-minute ride from Faaʻa International Airport (PPT).',
  },
  {
    title: 'High-speed Wi-Fi',
    detail:
      'Fibre throughout the property, fast enough for video calls from the terrace.',
  },
  {
    title: 'Kayaks &amp; snorkeling gear',
    detail:
      'Two kayaks, fins, masks and reef-safe sunscreen ready under the fare by the lagoon.',
  },
]

const EXTRAS: ReadonlyArray<{ title: string; detail: string; from: string }> = [
  {
    title: 'Curated excursions',
    detail:
      'Lagoon snorkeling, 4×4 island tour, sunset sail, whale watching (in season).',
    from: 'from $150 / person',
  },
  {
    title: 'Private chef &amp; catering',
    detail:
      'Polynesian-French menus prepared on the terrace by a chef from our concierge network.',
    from: 'from $200 / dinner',
  },
  {
    title: 'In-villa spa services',
    detail:
      'Taurumi massage with warm monoï oil, manicure, facial — booked the same day if availability allows.',
    from: 'from $150 / session',
  },
  {
    title: 'Thai massage at home',
    detail:
      'In-villa taurumi massage with warm monoï oil by our certified partner therapist — booked on request.',
    from: 'from $150 / session',
  },
]

/**
 * RatesInclusions — two-column "What's included / What's extra".
 * Splits the stay into all-in items and bookable add-ons so visitors
 * can mental-budget without surprises.
 */
export function RatesInclusions() {
  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">What you get</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              The price covers more than a bed
            </h2>
          </div>
          <p className="font-sans text-body-md text-midnight-400">
            Everything below is included in the nightly rate. The add-ons
            to the right are optional — most guests pick two or three.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Included */}
          <article className="flex flex-col rounded-3xl border border-leaf/30 bg-pearl p-8 shadow-soft">
            <header className="mb-6 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-leaf/10 text-leaf">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-h3-luxe font-medium text-midnight">
                Included in every stay
              </h3>
            </header>
            <ul className="flex flex-col gap-5">
              {INCLUDED.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-leaf"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-sans text-body-md font-semibold text-midnight">
                      {item.title}
                    </p>
                    <p className="mt-1 font-sans text-body-sm text-midnight-400">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          {/* Extras */}
          <article className="flex flex-col rounded-3xl border border-gold/30 bg-pearl p-8 shadow-soft">
            <header className="mb-6 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-h3-luxe font-medium text-midnight">
                Optional add-ons
              </h3>
            </header>
            <ul className="flex flex-col gap-5">
              {EXTRAS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Plus
                    className="mt-1 h-4 w-4 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-sans text-body-md font-semibold text-midnight">
                        {item.title}
                      </p>
                      <span className="text-eyebrow uppercase tracking-widest2 text-gold">
                        {item.from}
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-body-sm text-midnight-400">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </Section>
  )
}
