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
import { getSiteContent } from '@/lib/content'
import type { ContactFormLabels } from '@/lib/content/contact'

/**
 * /contact — public inquiry page.
 *
 * Server component: fetches the `Settings` singleton for contact details
 * (email, phone, socials). The form itself is a nested client component
 * (`ContactForm`) — keeps the rest of the page server-rendered for
 * better LCP and SEO. Phase E will plug the form's submit into a real
 * `/api/contact` route handler backed by Resend.
 *
 * Copy is overridable from /admin/content/contact. Because the form is a
 * client component and `getSiteContent()` is server-only, its strings are
 * resolved here and handed down as one `labels` prop. The fallbacks below are
 * the published defaults and must mirror `CONTACT_CONTENT_DEFAULTS`.
 */

export const metadata: Metadata = buildMetadata({
  title: 'Contact — Villa Paradise Tahiti',
  description:
    'Get in touch with our concierge team in Tahiti. We respond within 4 hours (UTC−10), 7 days a week.',
  path: '/contact',
})

export default async function ContactPage() {
  const settings = await sanityFetch<Settings | null>(settingsQuery)
  const t = await getSiteContent()

  const formLabels: ContactFormLabels = {
    name: t('contact.field.name', 'Full name'),
    email: t('contact.field.email', 'Email'),
    phone: t('contact.field.phone', 'Phone'),
    phoneHelper: t('contact.field.phone_helper', 'So we can reach you faster if needed.'),
    optional: t('contact.field.optional', 'Optional'),
    datesLegend: t('contact.field.dates_legend', 'Travel dates'),
    arrival: t('contact.field.arrival', 'Arrival'),
    arrivalAria: t('contact.field.arrival_aria', 'Choose a check-in date'),
    departure: t('contact.field.departure', 'Departure'),
    departureAria: t('contact.field.departure_aria', 'Choose a check-out date'),
    guests: t('contact.field.guests', 'Number of guests'),
    message: t('contact.field.message', 'How can we help?'),
    messageHelper: t(
      'contact.field.message_helper',
      'Share your travel plans, questions, or special requests (20+ characters).',
    ),
    submit: t('contact.field.submit', 'Send Inquiry'),
    submitting: t('contact.field.submitting', 'Sending…'),
    error: t(
      'contact.field.error',
      'Something went wrong. Please try again or email us directly.',
    ),
    privacyText: t('contact.field.privacy_text', 'By submitting, you agree to our'),
    privacyLink: t('contact.field.privacy_link', 'Privacy Policy'),
    successTitle: t('contact.success.title', 'Thank you.'),
    successBody: t(
      'contact.success.body',
      "We'll be in touch within 4 hours (Tahiti time, UTC−10). In the meantime, feel free to explore our",
    ),
    successLink: t('contact.success.link', 'curated experiences'),
    successAgain: t('contact.success.again', 'Send another inquiry'),
  }

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
                  {t('contact.form.eyebrow', 'Inquiry form')}
                </p>
                <h2 className="mt-2 font-heading text-h2-luxe font-medium text-midnight">
                  {t('contact.form.title', 'Tell us about your trip')}
                </h2>
                <p className="mt-3 max-w-prose font-sans text-body-md text-midnight-400">
                  {t(
                    'contact.form.intro',
                    'Share your dates, group size, and anything that would make the stay perfect. The more we know, the better we can tailor it.',
                  )}
                </p>
              </div>

              <ContactForm labels={formLabels} />
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
