import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  Globe2,
  Languages,
  MapPin,
  Plane,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { AirlineLogosBanner } from '@/components/marketing/AirlineLogosBanner'
import { FlightSearchForm } from '@/components/marketing/FlightSearchForm'
import { JsonLd, breadcrumbSchema } from '@/components/seo'
import { Button, Container, Section } from '@/components/ui'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'
import { getSiteContent } from '@/lib/content'
import { GETTING_HERE_ROUTES } from '@/lib/content/getting-here'

export const metadata: Metadata = buildMetadata({
  title: 'Getting to Tahiti — Villa Paradise Tahiti',
  description:
    'Direct flights to Tahiti (PPT), travel times from LA, San Francisco, Paris, Tokyo and more, plus a quick flight search and travel essentials for your stay.',
  path: '/getting-here',
})

interface RouteRow {
  from: string
  iata: string
  carriers: string
  duration: string
  note?: string
}

/** Icons stay in code, keyed by position; only the words are editable. */
const ESSENTIAL_ICONS: ReadonlyArray<LucideIcon> = [Globe2, Wallet, Clock, Languages]

/** Published defaults for the route table, mirrored in the content registry. */
const ROUTE_DEFAULTS: Readonly<Record<string, RouteRow>> = {
  r1: {
    from: 'Los Angeles',
    iata: 'LAX → PPT',
    carriers: 'Air Tahiti Nui, French Bee, Delta (seasonal)',
    duration: '≈ 8h 20m direct',
    note: 'Daily departures year-round.',
  },
  r2: {
    from: 'San Francisco',
    iata: 'SFO → PPT',
    carriers: 'United Airlines, French Bee',
    duration: '≈ 8h direct',
    note: 'United has flown this route nonstop since late 2022, the only US legacy carrier serving Tahiti direct.',
  },
  r3: {
    from: 'Seattle',
    iata: 'SEA → PPT',
    carriers: 'Delta (seasonal)',
    duration: '≈ 9h direct',
    note: 'Seasonal service. Check Skyscanner for current frequencies.',
  },
  r4: {
    from: 'New York / Boston',
    iata: 'JFK / BOS → PPT',
    carriers: 'United or Delta via LAX / SFO',
    duration: '≈ 14h total',
    note: '',
  },
  r5: {
    from: 'Paris',
    iata: 'CDG → PPT',
    carriers: 'Air Tahiti Nui, French Bee, Air France (codeshare via LAX or SFO)',
    duration: '≈ 22h total',
    note: '',
  },
  r6: {
    from: 'Auckland',
    iata: 'AKL → PPT',
    carriers: 'Air Tahiti Nui',
    duration: '≈ 5h direct',
    note: '',
  },
  r7: {
    from: 'Tokyo',
    iata: 'HND / NRT → PPT',
    carriers: 'Air Tahiti Nui (seasonal)',
    duration: '≈ 11h direct',
    note: '',
  },
}

/**
 * /getting-here — Public "Getting to Tahiti" page.
 *
 * Layout and icons are hardcoded; every word is overridable from
 * /admin/content/getting-here, with the fallbacks below as the published
 * defaults (mirrored in `lib/content/getting-here.ts`). Emptying a route's
 * departure city drops that table row, which is how an operator retires a
 * liaison when a carrier stops flying it.
 *
 * The interactive search is the only client boundary; everything else renders
 * on the server. The flight form deep-links to Skyscanner in a new tab and
 * includes an affiliate `associateid` when
 * `NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID` is set. No third-party JS or cookies
 * are loaded on this page.
 */
export default async function GettingHerePage() {
  const t = await getSiteContent()

  const routes: RouteRow[] = GETTING_HERE_ROUTES.map((id) => {
    const d = ROUTE_DEFAULTS[id]
    return {
      from: t(`gh.route.${id}.from`, d.from),
      iata: t(`gh.route.${id}.iata`, d.iata),
      carriers: t(`gh.route.${id}.carriers`, d.carriers),
      duration: t(`gh.route.${id}.duration`, d.duration),
      note: t(`gh.route.${id}.note`, d.note ?? ''),
    }
  }).filter((r) => r.from.trim() !== '')

  const essentials = [
    {
      Icon: ESSENTIAL_ICONS[0],
      label: t('gh.essentials.e1.label', 'Visa'),
      value: t(
        'gh.essentials.e1.value',
        'Visa-free for US, EU, UK, Canada, Australia, NZ, up to 90 days.',
      ),
    },
    {
      Icon: ESSENTIAL_ICONS[1],
      label: t('gh.essentials.e2.label', 'Currency'),
      value: t(
        'gh.essentials.e2.value',
        'CFP Franc (XPF). USD and EUR widely accepted; cards work everywhere.',
      ),
    },
    {
      Icon: ESSENTIAL_ICONS[2],
      label: t('gh.essentials.e3.label', 'Time zone'),
      value: t('gh.essentials.e3.value', 'UTC−10 (same as Hawaii, no daylight saving).'),
    },
    {
      Icon: ESSENTIAL_ICONS[3],
      label: t('gh.essentials.e4.label', 'Language'),
      value: t(
        'gh.essentials.e4.value',
        'French and Tahitian. English is spoken at the villa and most hotels.',
      ),
    },
  ].filter((e) => e.label.trim() !== '')

  const headers = [
    t('gh.routes.th_from', 'From'),
    t('gh.routes.th_route', 'Route'),
    t('gh.routes.th_carriers', 'Carriers'),
    t('gh.routes.th_duration', 'Duration'),
  ]

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Getting Here', url: absoluteUrl('/getting-here') },
        ])}
      />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <Section tone="pearl" spacing="default">
        <Container className="pt-24">
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              {t('gh.hero.eyebrow', 'Getting Here')}
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
            </p>
            <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md">
              {t('gh.hero.title1', 'Plan your journey')}
              <span className="block not-italic font-heading font-normal text-gold">
                {t('gh.hero.title2', 'to paradise.')}
              </span>
            </h1>
            <p className="mt-8 max-w-prose font-sans text-body-md text-midnight-400 sm:text-body-lg">
              {t(
                'gh.hero.subtitle',
                'Tahiti is closer than you think: nonstop from the US West Coast in about eight hours. Below, the routes our guests use most, a quick way to search live flights, and the essentials for a smooth arrival.',
              )}
            </p>
          </div>
        </Container>
      </Section>

      {/* ─── Flight search form (moved above routes for instant action) ── */}
      <Section tone="pearl" spacing="compact">
        <Container className="max-w-3xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">{t('gh.search.eyebrow', 'Live search')}</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              {t('gh.search.title', 'Check fares & schedules')}
            </h2>
            <p className="max-w-prose font-sans text-body-md text-midnight-400">
              {t(
                'gh.search.intro',
                'Pick your departure city and dates, and Skyscanner opens in a focused popup, pre-filled with your search. We may earn a small commission if you book through that link, at no extra cost to you.',
              )}
            </p>
          </div>
          <FlightSearchForm />
        </Container>
      </Section>

      {/* ─── Airline logos banner ────────────────────────── */}
      <AirlineLogosBanner />

      {/* ─── Direct routes table ─────────────────────────── */}
      <Section tone="sand" spacing="default">
        <Container>
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">{t('gh.routes.eyebrow', 'Direct & one-stop routes')}</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              {t('gh.routes.title', 'Flying to Tahiti (PPT)')}
            </h2>
            <p className="max-w-prose font-sans text-body-md text-midnight-400">
              {t(
                'gh.routes.intro',
                "Tahiti's international airport, Faa'a (IATA code PPT), is a 25-minute drive from the villa. We'll arrange the transfer if you let us know your flight.",
              )}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-pearl shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-pearl-400 bg-pearl-300/40">
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400 sm:px-6"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r, idx) => (
                    <tr
                      key={r.iata}
                      className={idx < routes.length - 1 ? 'border-b border-pearl-400' : ''}
                    >
                      <td className="px-4 py-4 align-top font-sans text-sm font-medium text-midnight sm:px-6">
                        {r.from}
                      </td>
                      <td className="px-4 py-4 align-top font-mono text-sm text-midnight sm:px-6">
                        {r.iata}
                      </td>
                      <td className="px-4 py-4 align-top font-sans text-sm text-midnight-400 sm:px-6">
                        {r.carriers}
                        {r.note ? (
                          <span className="mt-1 block text-xs italic text-midnight-300">
                            {r.note}
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top font-sans text-sm text-midnight sm:px-6">
                        {r.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-center font-sans text-xs italic text-midnight-300">
            {t(
              'gh.routes.footnote',
              'Seasonal services (Delta, Air Tahiti Nui Tokyo) vary by month. The Skyscanner search above reflects current availability.',
            )}
          </p>
        </Container>
      </Section>

      {/* ─── Airport transfer ────────────────────────────── */}
      <Section tone="sand" spacing="compact">
        <Container className="max-w-3xl">
          <div className="rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-soft sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-h3-luxe font-medium text-midnight">
                  {t('gh.transfer.title', 'Airport transfer')}
                </h3>
                <p className="mt-3 font-sans text-body-md text-midnight-400">
                  {t(
                    'gh.transfer.body',
                    "Faa'a (PPT) to the villa is about 25 minutes by car. Share your flight number with us at booking and we'll have a private transfer ready at arrival, included for stays of seven nights or more, otherwise from $80 one-way.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─── Travel essentials ───────────────────────────── */}
      <Section tone="pearl" spacing="default">
        <Container>
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">{t('gh.essentials.eyebrow', 'Before you fly')}</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              {t('gh.essentials.title', 'Travel essentials')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {essentials.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
                  {label}
                </p>
                <p className="mt-2 font-sans text-body-sm text-midnight">{value}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─── Final CTA ───────────────────────────────────── */}
      <Section tone="midnight" spacing="compact">
        <Container className="max-w-3xl text-center">
          <p className="eyebrow text-gold">{t('gh.cta.eyebrow', 'Ready when you are')}</p>
          <h2 className="mt-4 font-display text-h2-luxe font-light italic text-pearl">
            {t('gh.cta.title', 'Lock in your dates.')}
          </h2>
          <p className="mt-6 font-sans text-body-md text-pearl/70">
            {t(
              'gh.cta.subtitle',
              'Once your flights are sorted, secure the villa for those nights with a 30% deposit. Cancellation is flexible up to 60 days out.',
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link href="/booking">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {t('gh.cta.primary', 'Check availability')}
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/contact">
                <Plane className="h-4 w-4" aria-hidden="true" />
                {t('gh.cta.secondary', 'Ask a travel question')}
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
