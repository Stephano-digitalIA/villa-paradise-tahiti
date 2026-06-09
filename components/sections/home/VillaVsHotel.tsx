import { KeyRound, Wallet, Sparkles } from 'lucide-react'

import { Container, Section } from '@/components/ui'
import { getSiteContent } from '@/lib/content'

/**
 * Villa vs Hotel — Homepage.
 *
 * Indexable SEO content positioning the villa as the luxury alternative to a
 * Tahiti hotel (captures "Tahiti hotel" intent). All copy is editable + bilingual
 * via getSiteContent (`home.vshotel.*`).
 */

interface Point {
  Icon: typeof KeyRound
  title: string
  body: string
}

export async function VillaVsHotel() {
  const t = await getSiteContent()

  const points: Point[] = [
    {
      Icon: KeyRound,
      title: t('home.vshotel.p1.title', 'The whole place to yourself'),
      body: t(
        'home.vshotel.p1.body',
        'No shared lobbies, lifts or crowded pools. Where a Tahiti hotel rents you a single room, the villa is entirely yours — four bedrooms, a private heated pool and not a neighbour in sight.',
      ),
    },
    {
      Icon: Wallet,
      title: t('home.vshotel.p2.title', 'More space, better value'),
      body: t(
        'home.vshotel.p2.body',
        'For the price of two or three hotel rooms, your group gets a full villa, a heated infinity pool and an included car — space and freedom a resort simply cannot match.',
      ),
    },
    {
      Icon: Sparkles,
      title: t('home.vshotel.p3.title', 'A host, not a front desk'),
      body: t(
        'home.vshotel.p3.body',
        'Skip the check-in queue. One owner-concierge curates your whole week — private chef nights, excursions and airport transfers — with a personal touch no hotel front desk can offer.',
      ),
    },
  ]

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            {t('home.vshotel.eyebrow', 'Villa vs Hotel')}
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
            {t('home.vshotel.title', 'Why a private villa beats a Tahiti hotel')}
          </h2>
          <p className="mt-6 font-sans text-body-md text-midnight-400 sm:text-body-lg">
            {t(
              'home.vshotel.intro',
              'A hotel gives you a room. Villa Paradise gives you an entire private estate in Tahiti — more space, more privacy and more personal care, often for less than a comparable resort stay.',
            )}
          </p>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-10">
          {points.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-pearl-400 bg-pearl-100 p-8 shadow-soft transition-all duration-400 ease-luxe hover:-translate-y-1 hover:shadow-card"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-700"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="font-heading text-h3-luxe font-medium text-midnight">{title}</h3>
              <p className="font-sans text-body-md text-midnight-400">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
