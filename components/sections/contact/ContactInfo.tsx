import { Mail, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Settings } from '@/lib/cms'
import { CONTACT_EMAIL } from '@/lib/constants'
import { getSiteContent } from '@/lib/content'

/**
 * ContactInfo — right-column block on /contact.
 *
 * Server component. The email and phone themselves come from Réglages
 * (`settings.contactEmail` / `contactPhone`), which stays the one place a
 * contact detail is changed; only the words around them are overridable from
 * /admin/content/contact. The strings below are the published defaults and
 * must mirror `CONTACT_CONTENT_DEFAULTS`.
 */

interface ContactInfoProps {
  settings: Settings | null
}

const DEFAULT_EMAIL = CONTACT_EMAIL
const DEFAULT_PHONE_DISPLAY = '+689 89 21 00 53'
const DEFAULT_PHONE_RAW = '+68989210053'

export async function ContactInfo({ settings }: ContactInfoProps) {
  const t = await getSiteContent()

  const email = settings?.contactEmail || DEFAULT_EMAIL
  const phoneDisplay = settings?.contactPhone || DEFAULT_PHONE_DISPLAY
  const phoneHref = settings?.contactPhone
    ? `tel:${settings.contactPhone.replace(/\s+/g, '')}`
    : `tel:${DEFAULT_PHONE_RAW}`

  return (
    <aside
      aria-labelledby="contact-info-heading"
      className={cn(
        'rounded-2xl border border-pearl-400 bg-pearl p-8 sm:p-10',
        'shadow-soft'
      )}
    >
      <h2
        id="contact-info-heading"
        className="font-heading text-h3-luxe text-midnight"
      >
        {t('contact.info.title', 'Reach us directly')}
      </h2>
      <p className="mt-3 font-sans text-body-md text-midnight-400">
        {t(
          'contact.info.intro',
          'Our concierge team is based in Tahiti and replies in English, French, and Polynesian.',
        )}
      </p>

      <dl className="mt-8 space-y-6">
        <InfoRow
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          label={t('contact.info.label_email', 'Email')}
        >
          <a
            href={`mailto:${email}`}
            className="text-midnight underline-offset-4 hover:text-gold hover:underline"
          >
            {email}
          </a>
        </InfoRow>

        <InfoRow
          icon={<Phone className="h-5 w-5" aria-hidden="true" />}
          label={t('contact.info.label_phone', 'Phone & WhatsApp')}
        >
          <a
            href={phoneHref}
            className="text-midnight underline-offset-4 hover:text-gold hover:underline"
          >
            {phoneDisplay}
          </a>
        </InfoRow>

        <InfoRow
          icon={
            <span
              className="inline-flex h-5 w-5 items-center justify-center font-heading text-base text-gold"
              aria-hidden="true"
            >
              {'⏱'}
            </span>
          }
          label={t('contact.info.label_response', 'Response time')}
        >
          <span className="text-midnight">
            {t('contact.info.response_value', 'We respond within 4 hours')}
            <span className="block text-body-sm text-midnight-400">
              {t('contact.info.response_sub', 'Tahiti time (UTC−10), 7 days a week')}
            </span>
          </span>
        </InfoRow>

        <InfoRow
          icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
          label={t('contact.info.label_location', 'Location')}
        >
          <span className="text-midnight">
            {t('contact.info.location_value', 'Punaauia, Tahiti, French Polynesia')}
          </span>
        </InfoRow>
      </dl>
    </aside>
  )
}

/* ---------- Internal sub-components ---------- */

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4">
      <span
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          'bg-gold/10 text-gold'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-eyebrow font-semibold uppercase text-midnight-400">
          {label}
        </dt>
        <dd className="mt-1 font-sans text-body-md leading-relaxed">{children}</dd>
      </div>
    </div>
  )
}
