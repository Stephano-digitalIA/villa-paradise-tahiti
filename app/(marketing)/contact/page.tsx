import type { Metadata } from 'next'

import {
  JsonLd,
  breadcrumbSchema,
  contactPageSchema,
  organizationSchema,
} from '@/components/seo'
import { Container, Section } from '@/components/ui'
import {
  ContactForm,
  ContactHero,
  ContactInfo,
  ContactStats,
} from '@/components/sections/contact'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { settingsQuery, type Settings } from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

/**
 * /contact — public inquiry page.
 *
 * Server component: fetches the `Settings` singleton for contact details
 * (email, phone, socials). The form itself is a nested client component
 * (`ContactForm`) — keeps the rest of the page server-rendered for
 * better LCP and SEO. Phase E will plug the form's submit into a real
 * `/api/contact` route handler backed by Resend.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Contact — Villa Paradise Tahiti',
  description:
    'Get in touch with our concierge team in Tahiti. We respond within 4 hours (UTC−10), 7 days a week.',
  path: '/contact',
})

export default async function ContactPage() {
  const settings = await sanityFetch<Settings | null>(settingsQuery)

  return (
    <>
      <JsonLd
        data={contactPageSchema({
          name: 'Contact Villa Paradise Tahiti',
          description:
            'Reach our Tahiti-based concierge to plan your private villa stay. 4-hour reply window.',
          path: '/contact',
        })}
      />
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Contact', url: absoluteUrl('/contact') },
        ])}
      />
      <ContactHero />

      <Section tone="pearl" spacing="compact">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Left — inquiry form */}
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <p className="text-eyebrow font-semibold uppercase text-gold">
                  Inquiry form
                </p>
                <h2 className="mt-2 font-heading text-h2-luxe font-medium text-midnight">
                  Tell us about your trip
                </h2>
                <p className="mt-3 max-w-prose font-sans text-body-md text-midnight-400">
                  Share your dates, group size, and anything that would make the
                  stay perfect. The more we know, the better we can tailor it.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Right — contact details */}
            <div className="order-1 lg:order-2">
              <ContactInfo settings={settings} />
            </div>
          </div>
        </Container>
      </Section>

      <ContactStats />
    </>
  )
}
