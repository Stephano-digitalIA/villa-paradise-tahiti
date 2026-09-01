import { Container, Section } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Price } from '@/components/currency'
import { SEASONAL_RATES } from '@/lib/booking/pricing'
import type { Season } from '@/lib/booking/types'
import type { Settings } from '@/lib/sanity'
import { getSiteContent } from '@/lib/content'

interface SeasonRate {
  name: string
  /** Maps to the Supabase settings rate field + the SEASONAL_RATES fallback. */
  key: Season
  badge?: 'standard' | 'popular' | 'peak'
  unit: string
  window: string
  blurb: string
}

/** Live nightly rate for a season: Supabase settings override, else SEASONAL_RATES fallback. */
function seasonPrice(key: Season, settings: Settings | null): number {
  const override =
    key === 'low'
      ? settings?.rate_low_usd
      : key === 'high'
        ? settings?.rate_high_usd
        : settings?.rate_peak_usd
  return override ?? SEASONAL_RATES[key]
}

/**
 * RatesGrid — three seasonal price cards.
 *
 * The *prices* come from Supabase settings (/admin/settings); the labels,
 * windows and blurbs around them come from /admin/content/rates. The strings
 * below are the published defaults and must mirror `RATES_CONTENT_DEFAULTS`.
 *
 * The layout mirrors a typical Polynesian villa rental pricing table: three
 * tiers, ascending, with the "popular" middle tier visually emphasised via a
 * luxe ring.
 */
export async function RatesGrid({ settings = null }: { settings?: Settings | null }) {
  const t = await getSiteContent()
  const unit = t('rates.grid.unit', 'per night')

  const seasons: SeasonRate[] = [
    {
      name: t('rates.grid.low.name', 'Low Season'),
      key: 'low',
      badge: 'standard',
      unit,
      window: t('rates.grid.low.window', 'May – June · October – November'),
      blurb: t(
        'rates.grid.low.blurb',
        'Soft trade winds, fewer travelers and the most generous pricing of the year. Our favorite period.',
      ),
    },
    {
      name: t('rates.grid.high.name', 'High Season'),
      key: 'high',
      badge: 'popular',
      unit,
      window: t('rates.grid.high.window', 'July – September · December – early January'),
      blurb: t(
        'rates.grid.high.blurb',
        'Whale-watching season, dry sunny days, golden hour at the pool.',
      ),
    },
    {
      name: t('rates.grid.peak.name', 'Peak Holidays'),
      key: 'peak',
      badge: 'peak',
      unit,
      window: t('rates.grid.peak.window', 'Christmas week · New Year · Easter'),
      blurb: t(
        'rates.grid.peak.blurb',
        'Villa Paradise Tahiti is the best place to celebrate your Christmas and New Year holidays.',
      ),
    },
  ]

  return (
    <Section tone="sand" spacing="default">
      <Container>
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <p className="eyebrow">{t('rates.grid.eyebrow', 'Nightly rates')}</p>
          <h2 className="font-heading text-h2-luxe font-medium text-midnight">
            {t('rates.grid.title', 'Pricing by season')}
          </h2>
          <p className="max-w-prose font-sans text-body-md text-midnight-400">
            {t(
              'rates.grid.intro',
              'Prices apply to the entire villa (sleeps 8). A 5-night minimum stay applies in low and high season; 7 nights during the peak holiday weeks.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {seasons.map((season) => {
            const isPopular = season.badge === 'popular'
            const isPeak = season.badge === 'peak'
            const priceUSD = seasonPrice(season.key, settings)

            return (
              <article
                key={season.key}
                className={
                  'flex flex-col rounded-3xl border bg-pearl p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card ' +
                  (isPopular
                    ? 'border-gold ring-2 ring-gold/40'
                    : 'border-pearl-400')
                }
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-eyebrow uppercase tracking-widest2 text-midnight-400">
                      {season.name}
                    </p>
                    <p className="mt-1 font-sans text-body-sm text-midnight-400">
                      {season.window}
                    </p>
                  </div>
                  {isPopular ? (
                    <Badge variant="luxe" size="sm">
                      {t('rates.grid.badge_popular', 'Most booked')}
                    </Badge>
                  ) : isPeak ? (
                    <Badge variant="warning" size="sm">
                      {t('rates.grid.badge_peak', 'Limited')}
                    </Badge>
                  ) : null}
                </header>

                <div className="mt-8 flex items-baseline gap-2">
                  <Price
                    valueUSD={priceUSD}
                    className="font-heading text-h1-luxe font-medium text-midnight"
                  />
                  <span className="font-sans text-body-sm text-midnight-400">
                    / {season.unit}
                  </span>
                </div>

                <p className="mt-6 font-sans text-body-sm leading-relaxed text-midnight-400">
                  {season.blurb}
                </p>
              </article>
            )
          })}
        </div>

        <p className="mt-10 text-center font-sans text-body-sm italic text-midnight-400">
          {t(
            'rates.grid.footnote',
            'Stays of 14+ nights qualify for a 10% extended-stay discount. Mention it when you enquire.',
          )}
        </p>
      </Container>
    </Section>
  )
}
