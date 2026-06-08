import Link from 'next/link'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'
import { getSiteContent } from '@/lib/content'

export async function HeroHome() {
  const t = await getSiteContent()
  return (
    <section
      className="mx-4 flex min-h-screen flex-col items-center justify-center rounded-3xl bg-sand px-8 pb-16 pt-16 text-center sm:px-12 lg:mx-8 lg:mt-[5.5rem] lg:px-16 xl:px-20"
      aria-label="Villa Paradise Tahiti hero"
    >
      <div className="w-full max-w-2xl">
        <p className="mb-6 flex items-center justify-center gap-3 font-sans text-eyebrow font-medium uppercase tracking-widest2 text-gold">
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          {t('home.hero.eyebrow', 'Tahiti · French Polynesia')}
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
        </p>

        <h1 className="font-display text-hero-sm font-light italic leading-[1.02] text-midnight sm:text-hero-md lg:text-hero-lg">
          {t('home.hero.title1', 'Your Private Paradise')}
          <span className="block not-italic font-heading font-normal text-gold">
            {t('home.hero.title2', 'in the Heart of French Polynesia')}
          </span>
        </h1>

        <p className="mt-8 font-sans text-body-md text-midnight/70 sm:text-body-lg">
          {t(
            'home.hero.subtitle',
            'A private villa perched on the island’s heights of Tahiti, where the Pacific stretches out at your feet — a heated infinity pool, Moorea on the horizon, and a concierge service curating every detail of your week in paradise.',
          )}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href={bookingHref}>{t('home.hero.cta_primary', 'Book Now')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/villa">{t('home.hero.cta_secondary', 'Discover the Villa')}</Link>
          </Button>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-midnight/15 pt-8 text-midnight/60">
          <div className="flex items-center gap-2">
            <div className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="font-sans text-body-sm font-semibold text-midnight">4.9</span>
            <span className="font-sans text-body-sm">on Airbnb</span>
          </div>
          <span className="hidden h-4 w-px bg-midnight/20 sm:block" aria-hidden="true" />
          <span className="font-sans text-body-sm">{t('home.hero.trust_reviews', '47 Verified Reviews')}</span>
          <span className="hidden h-4 w-px bg-midnight/20 sm:block" aria-hidden="true" />
          <span className="font-sans text-body-sm">{t('home.hero.trust_location', 'Punaauia, Tahiti')}</span>
        </div>
      </div>
    </section>
  )
}
