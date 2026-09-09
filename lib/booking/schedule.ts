/**
 * Three-instalment payment plan, on the model used by the large rental
 * platforms: a quarter at booking, a quarter part-way through the wait, the
 * rest thirty days before arrival.
 *
 * Nobody lends anything here. The guest pays the villa directly, in stages,
 * which is what makes a four-thousand-dollar stay booked six months ahead
 * bearable. It is not the French "paiement en 3 fois", where a lender pays the
 * merchant in full and collects from the buyer.
 *
 * All arithmetic is in integer cents, like the rest of `lib/booking`. Money
 * split three ways in floating point does not add back up.
 */
import { toCents, fromCents } from './pricing'

/** Share of the total taken at booking, and again mid-way. */
const FIRST_SHARE = 0.25
const SECOND_SHARE = 0.25

/** The last instalment falls due this many days before arrival. */
export const FINAL_DUE_DAYS_BEFORE = 30

/**
 * A plan needs room to breathe. Below this many days before arrival there is
 * no point splitting: the instalments would fall on top of each other, or the
 * last one would already be overdue.
 */
export const MIN_DAYS_FOR_PLAN = 60

export interface Instalment {
  sequence: 1 | 2 | 3
  label: string
  amount: number
  /** ISO date, `YYYY-MM-DD`. The first one is always today. */
  dueDate: string
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 86_400_000)
}

/** Whole days from `from` to `to`, negative if `to` is in the past. */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  return Math.round((b - a) / 86_400_000)
}

/**
 * Can this booking be paid in three?
 *
 * Refused when arrival is too near, because the second instalment would land
 * within days of the first and the plan would be a formality rather than a
 * convenience.
 */
export function isPlanAvailable(checkIn: string, today: Date = new Date()): boolean {
  const arrival = new Date(`${checkIn}T00:00:00Z`)
  if (Number.isNaN(arrival.getTime())) return false
  return daysBetween(today, arrival) >= MIN_DAYS_FOR_PLAN
}

/**
 * Build the three instalments for a stay.
 *
 * The last one carries the remainder rather than its own percentage, so the
 * three always add back to the total exactly. Rounding a third instalment
 * independently is how a plan ends up a cent short, or a cent over, which is
 * worse: the guest is charged more than the price they agreed to.
 *
 * Returns null when the plan does not apply, so a caller cannot accidentally
 * offer one on a stay arriving next week.
 */
export function buildSchedule(
  totalUSD: number,
  checkIn: string,
  today: Date = new Date(),
): Instalment[] | null {
  if (!isPlanAvailable(checkIn, today)) return null
  if (!(totalUSD > 0)) return null

  const totalCents = toCents(totalUSD)
  const firstCents = Math.round(totalCents * FIRST_SHARE)
  const secondCents = Math.round(totalCents * SECOND_SHARE)
  const thirdCents = totalCents - firstCents - secondCents

  const arrival = new Date(`${checkIn}T00:00:00Z`)
  const finalDue = addDays(arrival, -FINAL_DUE_DAYS_BEFORE)
  // Half-way between today and the final due date, so the wait is split
  // evenly rather than by a fixed number of days that would be absurd on a
  // booking made a year ahead.
  const midDue = addDays(today, Math.floor(daysBetween(today, finalDue) / 2))

  return [
    {
      sequence: 1,
      label: 'À la réservation',
      amount: fromCents(firstCents),
      dueDate: isoDay(today),
    },
    {
      sequence: 2,
      label: 'Deuxième versement',
      amount: fromCents(secondCents),
      dueDate: isoDay(midDue),
    },
    {
      sequence: 3,
      label: 'Solde, 30 jours avant l’arrivée',
      amount: fromCents(thirdCents),
      dueDate: isoDay(finalDue),
    },
  ]
}

/** Human summary for the checkout screen, e.g. "3 versements de 1 000 $". */
export function describeSchedule(instalments: Instalment[]): string {
  return instalments
    .map((i) => `${i.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`)
    .join(' + ')
}
