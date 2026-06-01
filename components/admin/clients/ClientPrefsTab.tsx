import { Check, X } from 'lucide-react'

import type { Customer } from '@/lib/supabase/types'

interface ClientPrefsTabProps {
  customer: Customer
}

const SOURCE_LABEL: Record<string, string> = {
  direct: 'Direct booking',
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  vrbo: 'VRBO',
  referral: 'Referral',
  manual: 'Manual entry',
  imported: 'Imported',
}

const LANGUAGE_LABEL: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
}

export function ClientPrefsTab({ customer }: ClientPrefsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl border border-pearl-400 bg-pearl-300/40 px-4 py-2.5 font-sans text-xs italic text-midnight-400">
        Read-only view — preference editing arrives in P3.
      </p>

      <Section title="Marketing consent">
        <Row
          label="Accepts marketing emails"
          value={
            <span
              className={`inline-flex items-center gap-1.5 font-sans text-sm font-medium ${
                customer.accept_marketing ? 'text-leaf' : 'text-coral'
              }`}
            >
              {customer.accept_marketing ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {customer.accept_marketing ? 'Yes' : 'No'}
            </span>
          }
        />
        <Row
          label="Consent recorded at"
          value={
            customer.marketing_consent_at
              ? formatDateTime(customer.marketing_consent_at)
              : '—'
          }
        />
      </Section>

      <Section title="Locale & language">
        <Row
          label="Preferred language"
          value={
            customer.preferred_language
              ? LANGUAGE_LABEL[customer.preferred_language] ?? customer.preferred_language
              : '—'
          }
        />
      </Section>

      <Section title="Dietary & special notes">
        {customer.dietary_notes ? (
          <p className="whitespace-pre-wrap font-sans text-sm text-midnight">
            {customer.dietary_notes}
          </p>
        ) : (
          <p className="font-sans text-sm italic text-midnight-400">No notes recorded</p>
        )}
      </Section>

      <Section title="Acquisition">
        <Row
          label="Source"
          value={
            customer.acquisition_source
              ? SOURCE_LABEL[customer.acquisition_source] ?? customer.acquisition_source
              : '—'
          }
        />
        <Row label="Customer since" value={formatDate(customer.created_at)} />
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-pearl-400 bg-white p-5 shadow-sm">
      <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </section>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-pearl-400 pb-2 last:border-0 last:pb-0">
      <span className="font-sans text-sm text-midnight-400">{label}</span>
      <span className="font-sans text-sm font-medium text-midnight">{value}</span>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
