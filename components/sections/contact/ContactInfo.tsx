import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Settings } from '@/lib/sanity'

/**
 * ContactInfo — right-column block on /contact.
 *
 * Server component: reads the optional `Settings` document from Sanity
 * and falls back to sensible defaults when fields are missing. Each
 * block is keyboard-focusable when interactive (mailto:, tel:, social).
 */

interface ContactInfoProps {
  settings: Settings | null
}

const DEFAULT_EMAIL = 'villaparadisetahiti@gmail.com'
const DEFAULT_PHONE_DISPLAY = '+689 89 21 00 53'
const DEFAULT_PHONE_RAW = '+68989210053'
const DEFAULT_ADDRESS = 'Punaauia, Tahiti, French Polynesia'
const DEFAULT_INSTAGRAM = '#'
const DEFAULT_FACEBOOK = '#'

export function ContactInfo({ settings }: ContactInfoProps) {
  const email = settings?.contactEmail || DEFAULT_EMAIL
  const phoneDisplay = settings?.contactPhone || DEFAULT_PHONE_DISPLAY
  const phoneHref = settings?.contactPhone
    ? `tel:${settings.contactPhone.replace(/\s+/g, '')}`
    : `tel:${DEFAULT_PHONE_RAW}`
  const instagram = settings?.socialLinks?.instagram || DEFAULT_INSTAGRAM
  const facebook = settings?.socialLinks?.facebook || DEFAULT_FACEBOOK

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
        Reach us directly
      </h2>
      <p className="mt-3 font-sans text-body-md text-midnight-400">
        Our concierge team is based in Tahiti and replies in English, French, and
        Polynesian.
      </p>

      <dl className="mt-8 space-y-6">
        <InfoRow
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          label="Email"
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
          label="Phone & WhatsApp"
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
          label="Response time"
        >
          <span className="text-midnight">
            We respond within 4 hours
            <span className="block text-body-sm text-midnight-400">
              Tahiti time (UTC&minus;10), 7 days a week
            </span>
          </span>
        </InfoRow>

        <InfoRow
          icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
          label="Location"
        >
          <span className="text-midnight">{DEFAULT_ADDRESS}</span>
        </InfoRow>
      </dl>

      <div className="mt-8 border-t border-pearl-400 pt-6">
        <p className="text-eyebrow font-semibold uppercase text-gold">Follow us</p>
        <div className="mt-3 flex items-center gap-2">
          <SocialLink
            href={instagram}
            label="Instagram"
            icon={<Instagram className="h-4 w-4" aria-hidden="true" />}
          />
          <SocialLink
            href={facebook}
            label="Facebook"
            icon={<Facebook className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </div>
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

interface SocialLinkProps {
  href: string
  label: string
  icon: React.ReactNode
}

function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'border border-pearl-400 text-midnight-400',
        'transition-all duration-200',
        'hover:border-gold hover:text-gold'
      )}
    >
      {icon}
    </a>
  )
}
