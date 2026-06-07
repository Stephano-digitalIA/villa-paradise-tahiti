import { Check, Plus } from 'lucide-react'

import { Container, Section } from '@/components/ui'

const INCLUDED: ReadonlyArray<{ title: string; detail: string }> = [
  {
    title: 'Tropical welcome basket',
    detail:
      'Fresh papaya, mango, passion fruit, croissants and vanilla coffee awaiting you on the counter upon arrival.',
  },
  {
    title: 'Daily housekeeping (on request), weekly complimentary for long stays',
    detail: 'Linen, towels and kitchen refreshed on your schedule.',
  },
  {
    title: 'Private compact car',
    detail:
      'A small island car, five seats, fuel-efficient and parked at the villa, available for the entire duration of your stay.',
  },
  {
    title: 'Free airport transfer',
    detail:
      'Complimentary transfer by our taxi partner for the 25-minute journey from Faaʻa International Airport (PPT) or the ferry port.',
  },
  {
    title: 'High-speed Wi-Fi',
    detail:
      'Fibre optic available throughout the property, fast enough for video calls from the terrace or remote working.',
  },
  {
    title: 'Snorkelling equipment',
    detail: 'Fins, masks and reef-safe sunscreen are available.',
  },
]

const EXTRAS: ReadonlyArray<{ title: string; detail: string; from?: string }> = [
  {
    title: 'Excursions with our partners',
    detail:
      'Snorkelling in the lagoon, 4×4 island tour, catamaran excursion, VIP private boat excursion, sunset cruise, whale watching (in season).',
  },
  {
    title: 'Private chef & catering',
    detail:
      'Polynesian-French menus prepared on the terrace by a chef from our concierge network.',
    from: 'from $70 / dinner',
  },
  {
    title: 'In-villa spa services',
    detail:
      'Taurumi massage with warm monoï oil, manicure, facial — book same-day subject to availability.',
  },
  {
    title: 'In-home Thai massage',
    detail:
      'Taurumi in-villa massage with warm monoï oil by our certified partner therapist — on request.',
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
        <div className="mb-12">
          <p className="eyebrow mb-3">What you get</p>
          <h2 className="font-heading text-h2-luxe font-medium text-midnight">
            The price includes your well-being and:
          </h2>
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
                      {item.from ? (
                        <span className="text-eyebrow uppercase tracking-widest2 text-gold">
                          {item.from}
                        </span>
                      ) : null}
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
