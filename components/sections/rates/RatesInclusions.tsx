import { Check, Plus } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { Price } from '@/components/currency'
import { getSiteContent } from '@/lib/content'

/**
 * RatesInclusions — two-column "What's included / What's extra".
 * Splits the stay into all-in items and bookable add-ons so visitors
 * can mental-budget without surprises.
 *
 * Copy is overridable from /admin/content/rates; the strings below are the
 * published defaults and must mirror `RATES_CONTENT_DEFAULTS`. Emptying an
 * item's title in the admin removes that item from the list, which is how an
 * operator drops a perk without a code change.
 */
export async function RatesInclusions() {
  const t = await getSiteContent()

  const included: ReadonlyArray<{ title: string; detail: string }> = [
    {
      title: t('rates.inclusions.i1.title', 'Tropical welcome basket'),
      detail: t(
        'rates.inclusions.i1.body',
        'Fresh papaya, mango, passion fruit, croissants and vanilla coffee awaiting you on the counter upon arrival.',
      ),
    },
    {
      title: t(
        'rates.inclusions.i2.title',
        'Daily housekeeping (on request), weekly complimentary for long stays',
      ),
      detail: t(
        'rates.inclusions.i2.body',
        'Linen, towels and kitchen refreshed on your schedule.',
      ),
    },
    {
      title: t('rates.inclusions.i3.title', 'Private compact car'),
      detail: t(
        'rates.inclusions.i3.body',
        'A small island car, five seats, fuel-efficient and parked at the villa, available for the entire duration of your stay.',
      ),
    },
    {
      title: t('rates.inclusions.i4.title', 'Free airport transfer'),
      detail: t(
        'rates.inclusions.i4.body',
        'Complimentary transfer by our taxi partner for the 25-minute journey from Faaʻa International Airport (PPT) or the ferry port.',
      ),
    },
    {
      title: t('rates.inclusions.i5.title', 'High-speed Wi-Fi'),
      detail: t(
        'rates.inclusions.i5.body',
        'Fibre optic available throughout the property, fast enough for video calls from the terrace or remote working.',
      ),
    },
    {
      title: t('rates.inclusions.i6.title', 'Snorkelling equipment'),
      detail: t(
        'rates.inclusions.i6.body',
        'Fins, masks and reef-safe sunscreen are available.',
      ),
    },
  ].filter((item) => item.title.trim() !== '')

  const extras: ReadonlyArray<{ title: string; detail: string; fromUSD?: number }> = [
    {
      title: t('rates.inclusions.e1.title', 'Excursions with our partners'),
      detail: t(
        'rates.inclusions.e1.body',
        'Snorkelling in the lagoon, 4×4 island tour, catamaran excursion, VIP private boat excursion, sunset cruise, whale watching (in season).',
      ),
    },
    {
      title: t('rates.inclusions.e2.title', 'Private chef & catering'),
      detail: t(
        'rates.inclusions.e2.body',
        'Polynesian-French menus prepared on the terrace by a chef from our concierge network.',
      ),
      fromUSD: 70,
    },
    {
      title: t('rates.inclusions.e3.title', 'In-villa spa services'),
      detail: t(
        'rates.inclusions.e3.body',
        'Taurumi massage with warm monoï oil, manicure, facial. Book same-day subject to availability.',
      ),
    },
    {
      title: t('rates.inclusions.e4.title', 'In-home Thai massage'),
      detail: t(
        'rates.inclusions.e4.body',
        'Taurumi in-villa massage with warm monoï oil by our certified partner therapist, on request.',
      ),
    },
  ].filter((item) => item.title.trim() !== '')

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mb-12">
          <p className="eyebrow mb-3">{t('rates.inclusions.eyebrow', 'What you get')}</p>
          <h2 className="font-heading text-h2-luxe font-medium text-midnight">
            {t('rates.inclusions.title', 'The price includes your well-being and:')}
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
                {t('rates.inclusions.included_title', 'Included in every stay')}
              </h3>
            </header>
            <ul className="flex flex-col gap-5">
              {included.map((item) => (
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
                {t('rates.inclusions.extras_title', 'Optional add-ons')}
              </h3>
            </header>
            <ul className="flex flex-col gap-5">
              {extras.map((item) => (
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
                      {item.fromUSD ? (
                        <span className="text-eyebrow uppercase tracking-widest2 text-gold">
                          from <Price valueUSD={item.fromUSD} /> / dinner
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
