'use client'

/**
 * PriceSummary — sticky right column on desktop, full-width card on mobile.
 *
 *  - Reads everything from the Provider; no own state.
 *  - Mirrors the recap layout in docs/04-fonctionnalites.md §1.5.
 *  - "Continue to checkout" is disabled until the booking state is valid.
 *    (D2 will wire the navigation to `/booking/checkout`.)
 */

import Link from 'next/link'
import { Lock, ShieldCheck, X } from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { calculateExperienceLineTotal } from '@/lib/booking'
import { useCurrency } from '@/components/currency'

import { useBooking } from './BookingProvider'
import { SeasonBadge } from './SeasonBadge'

interface PriceSummaryProps {
  /** Optional class for layout overrides from the parent page. */
  className?: string
}

export function PriceSummary({ className }: PriceSummaryProps) {
  const {
    state,
    breakdown,
    validation,
    settings,
    removeExperience,
    availabilityConflict,
  } = useBooking()
  const { format } = useCurrency()

  // Block the CTA when the picked range overlaps a blocked period —
  // even if the pricing/min-nights validation is otherwise green.
  const canContinue = validation.isValid && !availabilityConflict

  const depositPercent = settings?.defaultDepositPercent ?? 30
  const hasNights = breakdown.nights > 0
  const hasExperiences = state.selectedExperiences.length > 0

  return (
    <aside
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-card lg:sticky lg:top-28',
        className,
      )}
      aria-label="Booking summary"
    >
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow font-medium uppercase tracking-widest2 text-gold">
          Your stay summary
        </p>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-h3-luxe font-medium text-midnight">
            {hasNights ? (
              <>
                {breakdown.nights} {breakdown.nights === 1 ? 'night' : 'nights'}
              </>
            ) : (
              <>Build your stay</>
            )}
          </h3>
          <SeasonBadge season={breakdown.season} />
        </div>
        <p className="font-sans text-body-sm text-midnight-400">
          {state.checkIn && state.checkOut
            ? `${formatStayRange(state.checkIn, state.checkOut)} · ${state.guests} ${
                state.guests === 1 ? 'guest' : 'guests'
              }`
            : `${state.guests} ${state.guests === 1 ? 'guest' : 'guests'} · Dates to pick`}
        </p>
      </div>

      {/* ─── Accommodation block ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
        <p className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
          Accommodation
        </p>
        <Row
          label={
            hasNights
              ? `Villa · ${breakdown.nights} ${breakdown.nights === 1 ? 'night' : 'nights'} × ${format(breakdown.nightlyRate)}`
              : 'Villa'
          }
          value={hasNights ? format(breakdown.villaSubtotal) : '—'}
        />
        <Row
          label="Cleaning fee"
          value={hasNights ? format(breakdown.cleaningFee) : '—'}
        />
      </div>

      {/* ─── Experiences block ───────────────────────────────────────── */}
      {hasExperiences ? (
        <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
          <p className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
            Experiences
          </p>
          <ul className="flex flex-col gap-1.5">
            {state.selectedExperiences.map((exp) => (
              <li
                key={exp.slug}
                className="flex items-center justify-between gap-3 text-body-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-midnight">
                    {exp.title}
                    {exp.priceUnit !== 'flat' ? (
                      <span className="text-midnight-400"> · {exp.quantity}</span>
                    ) : null}
                  </span>
                </div>
                <span className="font-sans font-semibold text-midnight">
                  {format(calculateExperienceLineTotal(exp))}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(exp.slug)}
                  aria-label={`Remove ${exp.title}`}
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-midnight-400 transition-colors hover:bg-coral/10 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ─── Totals ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-pearl-400 pt-4">
        <Row label="Subtotal" value={hasNights ? format(breakdown.subtotal) : '—'} />
        {breakdown.longStayDiscountApplied ? (
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            <span className="font-sans text-leaf">
              Long-stay discount ({breakdown.longStayDiscountPercent}% · {breakdown.longStayMinNights}+ nights)
            </span>
            <span className="font-sans font-semibold text-leaf">
              −{format(breakdown.longStayDiscount)}
            </span>
          </div>
        ) : null}
        <Row
          label="Taxes & fees"
          value={hasNights ? format(breakdown.taxes) : '—'}
          hint="No tax in French Polynesia."
        />
      </div>

      <div className="flex items-center justify-between border-t border-midnight/10 pt-4">
        <span className="font-heading text-base font-semibold uppercase tracking-wider2 text-midnight">
          Total
        </span>
        <span className="font-heading text-2xl font-medium text-midnight">
          {hasNights ? format(breakdown.total) : '—'}
        </span>
      </div>

      {hasNights ? (
        <div className="flex flex-col gap-2 rounded-xl bg-sand/50 p-4 text-body-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-midnight">
              Deposit today ({depositPercent}%)
            </span>
            <span className="font-heading font-semibold text-midnight">
              {format(breakdown.depositAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-midnight-400">
              Balance · 30 days before arrival
            </span>
            <span className="font-sans font-semibold text-midnight">
              {format(breakdown.balanceAmount)}
            </span>
          </div>
        </div>
      ) : null}

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Button
          asChild={canContinue}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!canContinue}
          aria-disabled={!canContinue}
        >
          {canContinue ? (
            <Link href="/booking/checkout">Continue to checkout</Link>
          ) : (
            <span>Continue to checkout</span>
          )}
        </Button>

        {!canContinue ? (
          <ul
            className="flex flex-col gap-1 text-xs text-midnight-400"
            aria-live="polite"
          >
            {availabilityConflict ? (
              <li>· These dates aren&apos;t available — pick a different window.</li>
            ) : null}
            {validation.issues.map((issue) => (
              <li key={issue}>· {issue}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center justify-center gap-3 text-xs text-midnight-400">
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span>Secure checkout · Stripe & PayPal</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-midnight-400">
          <ShieldCheck className="h-3 w-3 text-leaf" aria-hidden="true" />
          <span>100% refund for cancellations more than 60 days before arrival</span>
        </div>
      </div>
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
 * Local helpers
 * ------------------------------------------------------------------------- */

function formatStayRange(checkIn: string, checkOut: string): string {
  if (!isIso(checkIn) || !isIso(checkOut)) return ''
  return `${toUsDate(checkIn)} → ${toUsDate(checkOut)}`
}

function isIso(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso)
}

function toUsDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}
