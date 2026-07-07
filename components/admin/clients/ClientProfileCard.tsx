import { Mail, MapPin, Phone, Sparkles } from 'lucide-react'

import type { CustomerSummary, CustomerTag } from '@/lib/supabase/types'

import { ClientActions } from './ClientActions'
import { TagEditor } from './TagEditor'

interface ClientProfileCardProps {
  customer: CustomerSummary
  allTags: CustomerTag[]
}

export function ClientProfileCard({ customer, allTags }: ClientProfileCardProps) {
  const isAnon = !!customer.anonymized_at
  const fullName = isAnon
    ? '[Anonymisé]'
    : `${customer.first_name} ${customer.last_name}`.trim()
  const initial = (customer.first_name?.[0] ?? '?').toUpperCase()
  const status = deriveStatus(customer)

  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm lg:sticky lg:top-6">
      {/* ─── Identity ───────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gold text-xl font-semibold text-midnight"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-midnight truncate">
            {fullName}
          </h2>
          <p className="mt-1 font-sans text-xs text-midnight-400">
            Client depuis {formatDate(customer.created_at)}
          </p>
          {status ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-sans text-xs font-semibold text-midnight">
              <Sparkles className="h-3 w-3 text-gold" aria-hidden="true" />
              {status}
            </span>
          ) : null}
        </div>
      </div>

      {/* ─── Contacts ───────────────────────────────────── */}
      {!isAnon ? (
        <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
          <Contact icon={<Mail className="h-3.5 w-3.5" />} value={customer.email} href={`mailto:${customer.email}`} />
          {customer.phone ? (
            <Contact icon={<Phone className="h-3.5 w-3.5" />} value={customer.phone} href={`tel:${customer.phone}`} />
          ) : null}
          {customer.city || customer.country ? (
            <Contact
              icon={<MapPin className="h-3.5 w-3.5" />}
              value={[customer.city, customer.country].filter(Boolean).join(', ')}
            />
          ) : null}
        </div>
      ) : (
        <p className="border-t border-pearl-400 pt-4 font-sans text-xs italic text-midnight-400">
          Coordonnées supprimées (anonymisation RGPD).
        </p>
      )}

      {/* ─── Tags ───────────────────────────────────────── */}
      <div className="border-t border-pearl-400 pt-4">
        <TagEditor
          customerId={customer.id}
          assignedLabels={customer.tags}
          allTags={allTags}
        />
      </div>

      {/* ─── KPIs synthèse ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 border-t border-pearl-400 pt-4">
        <Kpi label="Séjours" value={String(customer.n_stays)} />
        <Kpi label="Chiffre d'affaires" value={formatUSD(customer.total_revenue)} />
        <Kpi
          label="Dernier séjour"
          value={customer.last_check_in ? formatDate(customer.last_check_in) : '—'}
        />
        <Kpi
          label="Prochain séjour"
          value={customer.next_check_in ? formatDate(customer.next_check_in) : '—'}
          highlight={!!customer.next_check_in}
        />
      </div>

      {/* ─── Actions ────────────────────────────────────── */}
      <div className="border-t border-pearl-400 pt-4">
        <ClientActions
          customerId={customer.id}
          customerEmail={customer.email}
          customerFirstName={customer.first_name}
          customerDisplayName={fullName}
          isAnonymized={isAnon}
          anonymizedAt={customer.anonymized_at}
        />
      </div>
    </aside>
  )
}

/* ───────────────────────────────────────────────────────── */

function Contact({
  icon,
  value,
  href,
}: {
  icon: React.ReactNode
  value: string
  href?: string
}) {
  const content = (
    <span className="inline-flex items-center gap-2 font-sans text-sm text-midnight">
      <span className="text-gold">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  )
  return href ? (
    <a href={href} className="block hover:text-gold">
      {content}
    </a>
  ) : (
    <span className="block">{content}</span>
  )
}

function Kpi({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-pearl-300/40 px-3 py-2.5">
      <span className="font-sans text-xs uppercase tracking-wider text-midnight-400">
        {label}
      </span>
      <span
        className={
          'font-heading text-sm font-semibold ' +
          (highlight ? 'text-gold' : 'text-midnight')
        }
      >
        {value}
      </span>
    </div>
  )
}

function deriveStatus(c: CustomerSummary): string | null {
  if (c.anonymized_at) return null
  if (c.n_stays >= 3) return 'VIP'
  if (c.n_stays >= 2) return 'Récurrent'
  if (c.n_stays === 1) return 'Fidèle'
  return 'Prospect'
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
