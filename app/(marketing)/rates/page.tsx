import type { Metadata } from 'next'

import {
  JsonLd,
  breadcrumbSchema,
  priceSpecificationSchema,
} from '@/components/seo'
import { RatesCta } from '@/components/sections/rates/RatesCta'
import { RatesGrid } from '@/components/sections/rates/RatesGrid'
import { RatesHero } from '@/components/sections/rates/RatesHero'
import { RatesInclusions } from '@/components/sections/rates/RatesInclusions'
import { RatesPolicy } from '@/components/sections/rates/RatesPolicy'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { settingsQuery, type Settings } from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Rates & Availability — Villa Paradise Tahiti',
  description:
    'Transparent direct rates for Villa Paradise. Low / High / Peak seasons in USD, included perks, cancellation policy and deposit terms.',
  path: '/rates',
})

/**
 * /rates — Pricing & policy hub.
 *
 * Static rates for now (placeholder values awaiting Thierry's input —
 * see TODO list in the report). The full date-driven calculator lands
 * with Phase D; this page is the pricing reference visitors land on.
 *
 * Structured data: a `Product` with three nightly `Offer` tiers so search
 * engines can surface the price range in lodging carousels. The values
 * mirror the visible cards in `<RatesGrid />`.
 */
export default async function RatesPage() {
  const settings = await sanityFetch<Settings | null>(settingsQuery)

  return (
    <>
      <JsonLd
        data={priceSpecificationSchema([
          {
            name: 'Low Season',
            priceUSD: 590,
            season: 'May – June, October – November',
          },
          {
            name: 'High Season',
            priceUSD: 890,
            season: 'July – September, December – early January',
          },
          {
            name: 'Peak Holidays',
            priceUSD: 1290,
            season: 'Christmas week, New Year, Easter',
          },
        ])}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Rates', url: absoluteUrl('/rates') },
        ])}
      />
      <RatesHero />
      <RatesGrid />
      <RatesInclusions />
      <RatesPolicy settings={settings} />
      <RatesCta />
    </>
  )
}
