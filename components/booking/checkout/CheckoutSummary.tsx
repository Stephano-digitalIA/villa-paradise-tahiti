'use client'

/**
 * CheckoutSummary — read-only recap of the cart on the checkout page.
 *
 *  - Sibling component of `PriceSummary` (Phase D1) but tuned for the
 *    `/booking/checkout` route: no mutators (no remove buttons), and a
 *    prominent "Edit booking" link back to `/booking`.
 *  - Sticky on desktop so it stays visible while the user fills the form.
 *  - The deposit number is the visual anchor — it's what the user is
 *    about to pay.
 *  - Trust mini-block at the bottom mirrors the badges shown elsewhere in
 *    the funnel for a consistent reassurance signal.
 */

import Link from 'next/link'
import { ArrowLeft, Lock, ShieldCheck, Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { calculateExperienceLineTotal, formatUSD } from '@/lib/booking'

import { useBooking } from '../BookingProvider'
import { SeasonBadge } from '../SeasonBadge'

interface CheckoutSummaryProps {
  className?: string
}

export function CheckoutSummary({ className }: CheckoutSummaryProps) {
  const { state, breakdown, settings } = useBooking()
  const depositPercent = settings?.defaultDepositPercent ?? 30

  return (
    <aside
      aria-label="Your stay summary"
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-card lg:sticky lg:top-24',
        className,
      )}
    >
      {/* ─── Header + edit ──────────────────────────────────────────── */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-eyebrow font-medium uppercase tracking-widest2 text-gold">
            Your stay
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest2 text-midnight-400 transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Edit booking
          </Link>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-h3-luxe font-medium leading-tight text-midnight">
              {formatStayRange(state.checkIn, state.checkOut) || 'Dates to pick'}
            </h2>
            <p className="mt-1 font-sans text-body-sm text-midnight-400">
              {breakdown.nights > 0
                ? `${breakdown.nights} ${breakdown.nights === 1 ? 'night' : 'nights'} · ${state.guests} ${state.guests === 1 ? 'guest' : 'guests'}`
                : `${state.guests} ${state.guests === 1 ? 'guest' : 'guests'}`}
            </p>
          </div>
          <SeasonBadge season={breakdown.season} />
        </div>
      </header>

      {/* ─── Accommodation ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
        <p className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
          Accommodation
        </p>
        <Row
          label={
            breakdown.nights > 0
              ? `Villa · ${breakdown.nights} ${breakdown.nights === 1 ? 'night' : 'nights'} × ${formatUSD(breakdown.nightlyRate)}`
              : 'Villa'
          }
          value={breakdown.nights > 0 ? formatUSD(breakdown.villaSubtotal) : '—'}
        />
        <Row
          label="Cleaning fee"
          value={breakdown.nights > 0 ? formatUSD(breakdown.cleaningFee) : '—'}
        />
      </div>

      {/* ─── Experiences ───────────────────────────────────────────── */}
      {state.selectedExperiences.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
          <p className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
            Experiences
          </p>
          <ul className="flex flex-col gap-1.5">
            {state.selectedExperiences.map((exp) => (
              <li
                key={exp.slug}
                className="flex items-baseline justify-between gap-3 text-body-sm"
              >
                <span className="min-w-0 flex-1 truncate font-sans text-midnight">
                  {exp.title}
                  {exp.priceUnit !== 'flat' ? (
                    <span className="text-midnight-400"> · {exp.quantity}</span>
                  ) : null}
                </span>
                <span className="font-sans font-semibold text-midnight">
                  {formatUSD(calculateExperienceLineTotal(exp))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ─── Subtotals ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
        <Row label="Subtotal" value={breakdown.nights > 0 ? formatUSD(breakdown.subtotal) : '—'} />
        <Row
          label="Taxes & fees"
          value={breakdown.nights > 0 ? formatUSD(breakdown.taxes) : '—'}
          hint="No tax in French Polynesia."
        />
      </div>

      {/* ─── Total ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-midnight/10 pt-4">
        <span className="font-heading text-base font-semibold uppercase tracking-wider2 text-midnight">
          Total
        </span>
        <span className="font-heading text-2xl font-medium text-midnight">
          {breakdown.nights > 0 ? formatUSD(breakdown.total) : '—'}
        </span>
      </div>

      {/* ─── Deposit / balance card ────────────────────────────────── */}
      {breakdown.nights > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl bg-sand/60 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold uppercase tracking-widest2 text-midnight">
                Due today
              </span>
              <span className="font-sans text-xs text-midnight-400">
                Deposit · {depositPercent}%
              </span>
            </div>
            <span className="font-heading text-2xl font-semibold text-midnight">
              {formatUSD(breakdown.depositAmount)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-midnight/10 pt-3 text-body-sm">
            <span className="font-sans text-midnight-400">
              Balance · 30 days before arrival
            </span>
            <span className="font-sans font-semibold text-midnight-400">
              {formatUSD(breakdown.balanceAmount)}
            </span>
          </div>
        </div>
      ) : null}

      {/* ─── Trust mini-block ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4 text-xs text-midnight-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3 text-gold" aria-hidden="true" />
          <span>Secure payment · Stripe & PayPal</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-leaf" aria-hidden="true" />
          <span>50% refund if cancelled 60+ days before arrival</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 text-gold" aria-hidden="true" />
          <span>4.9★ on Airbnb · 24h concierge response</span>
        </div>
      </div>

      {/* Tiny "what's persisted" hint so users feel safe to step away. */}
      <p className="hidden text-[10px] italic text-midnight-300 sm:block">
        Your selection is saved on this device — you can come back anytime.
      </p>
    </aside>
  )
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------- */

interface RowProps {
  label: string
  value: string
  hint?: string
}

function Row({ label, value, hint }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-body-sm">
      <div className="min-w-0 flex-1">
        <span className="font-sans text-midnight">{label}</span>
        {hint ? (
          <span className="ml-1 text-xs italic text-midnight-400">— {hint}</span>
        ) : null}
      </div>
      <span className="font-sans font-semibold text-midnight">{value}</span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/**
 * Format the stay window for display in US `mm/dd/yyyy` format, e.g.
 * `07/15/2026 – 07/22/2026`. Returns an empty string when either bound
 * is missing/invalid so the caller can fall back to a placeholder.
 */
function formatStayRange(checkIn: string | null, checkOut: string | null): string {
  if (!isIso(checkIn) || !isIso(checkOut)) return ''
  return `${toUsDate(checkIn!)} – ${toUsDate(checkOut!)}`
}

function isIso(iso: string | null): iso is string {
  return !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)
}

function toUsDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}
