'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { PaymentStatus } from '@/lib/supabase/types'

/* ───────────────────────────────────────────────────────────────
 * Types
 * ─────────────────────────────────────────────────────────────── */

export interface CalendarReservation {
  id: string
  reservation_ref: string
  check_in: string // YYYY-MM-DD
  check_out: string // YYYY-MM-DD (exclusive — i.e. the morning the guest leaves)
  guest_name: string | null
  num_guests: number
  payment_status: PaymentStatus
}

export interface CalendarBlock {
  id: string
  blocked_from: string // YYYY-MM-DD (inclusive)
  blocked_to: string // YYYY-MM-DD (inclusive)
  source: string // 'airbnb' | 'vrbo' | 'booking' | 'direct_booking' | 'owner' | 'maintenance'
  reason: string | null
}

interface MonthCalendarViewProps {
  reservations: CalendarReservation[]
  blocks: CalendarBlock[]
}

/* ───────────────────────────────────────────────────────────────
 * Date helpers (UTC-only, no timezone surprises)
 * ─────────────────────────────────────────────────────────────── */

function ymd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setUTCDate(c.getUTCDate() + n)
  return c
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
}

/** Sunday-anchored start of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const c = new Date(d)
  c.setUTCDate(c.getUTCDate() - c.getUTCDay())
  return c
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ───────────────────────────────────────────────────────────────
 * Source/status styles
 * ─────────────────────────────────────────────────────────────── */

const RESERVATION_STYLE: Record<PaymentStatus, { bar: string; dot: string }> = {
  pending:       { bar: 'bg-purple-500/85 text-white', dot: 'bg-purple-500' },
  deposit_paid:  { bar: 'bg-lagoon      text-pearl',   dot: 'bg-lagoon' },
  fully_paid:    { bar: 'bg-leaf        text-white',   dot: 'bg-leaf' },
  cancelled:     { bar: 'bg-midnight-300 text-pearl',  dot: 'bg-midnight-300' },
  refunded:      { bar: 'bg-gold/70     text-midnight', dot: 'bg-gold' },
}

const BLOCK_STYLE: Record<string, { bar: string; dot: string; label: string }> = {
  airbnb:         { bar: 'bg-rose-500/80    text-white',  dot: 'bg-rose-500',    label: 'Airbnb' },
  booking:        { bar: 'bg-indigo-500/80  text-white',  dot: 'bg-indigo-500',  label: 'Booking.com' },
  vrbo:           { bar: 'bg-cyan-600/80    text-white',  dot: 'bg-cyan-600',    label: 'VRBO' },
  direct_booking: { bar: 'bg-lagoon         text-pearl',  dot: 'bg-lagoon',      label: 'Direct' },
  owner:          { bar: 'bg-midnight       text-pearl',  dot: 'bg-midnight',    label: 'Owner' },
  maintenance:    { bar: 'bg-amber-600/80   text-white',  dot: 'bg-amber-600',   label: 'Maintenance' },
  turnover:       { bar: 'bg-red-600/80     text-white',  dot: 'bg-red-600',     label: 'Cleaning' },
}

function blockStyle(source: string) {
  return BLOCK_STYLE[source] ?? { bar: 'bg-midnight-400 text-pearl', dot: 'bg-midnight-400', label: source }
}

/* ───────────────────────────────────────────────────────────────
 * Main component
 * ─────────────────────────────────────────────────────────────── */

export function MonthCalendarView({ reservations, blocks }: MonthCalendarViewProps) {
  const [cursor, setCursor] = useState<Date>(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  })

  const todayIso = ymd(new Date())

  const { days, monthFirst, monthLast } = useMemo(() => {
    const monthFirst = startOfMonth(cursor)
    const monthLast = endOfMonth(cursor)
    const gridStart = startOfWeek(monthFirst)
    // 6 weeks × 7 days = 42 cells, covers any month layout
    const days: Date[] = []
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i))
    return { days, monthFirst, monthLast }
  }, [cursor])

  // Filter to anything that touches this month for perf
  const monthFirstIso = ymd(monthFirst)
  const monthLastIso = ymd(monthLast)
  const visibleReservations = reservations.filter(
    (r) => r.check_out > monthFirstIso && r.check_in <= monthLastIso,
  )
  const visibleBlocks = blocks.filter(
    (b) => b.blocked_to >= monthFirstIso && b.blocked_from <= monthLastIso,
  )

  function dayHasReservation(iso: string): CalendarReservation | undefined {
    // check_in inclusive, check_out exclusive (guest leaves on check_out)
    return visibleReservations.find((r) => iso >= r.check_in && iso < r.check_out)
  }

  function dayHasBlocks(iso: string): CalendarBlock[] {
    return visibleBlocks.filter((b) => iso >= b.blocked_from && iso <= b.blocked_to)
  }

  function gotoPrev() {
    setCursor((c) => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() - 1, 1)))
  }
  function gotoNext() {
    setCursor((c) => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 1)))
  }
  function gotoToday() {
    const now = new Date()
    setCursor(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)))
  }

  return (
    <section className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
      {/* ─── Toolbar ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 border-b border-pearl-400 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={gotoPrev}
            aria-label="Previous month"
            className="rounded-lg border border-pearl-400 bg-white p-2 text-midnight transition-colors hover:border-midnight"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={gotoToday}
            className="rounded-lg border border-pearl-400 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-midnight transition-colors hover:border-midnight"
          >
            Today
          </button>
          <button
            type="button"
            onClick={gotoNext}
            aria-label="Next month"
            className="rounded-lg border border-pearl-400 bg-white p-2 text-midnight transition-colors hover:border-midnight"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <h2 className="font-heading text-xl font-semibold text-midnight">
            {MONTH_NAMES[cursor.getUTCMonth()]} {cursor.getUTCFullYear()}
          </h2>
        </div>

        <Legend />
      </header>

      {/* ─── Weekday labels ──────────────────────────────────── */}
      <div className="grid grid-cols-7 border-b border-pearl-400 bg-pearl-300/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ─── Day grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const iso = ymd(day)
          const inMonth = day.getUTCMonth() === cursor.getUTCMonth()
          const isToday = iso === todayIso
          const reservation = dayHasReservation(iso)
          // Always compute blocks too — a direct reservation does NOT hide
          // overlapping iCal blocks anymore (e.g. an Airbnb / Booking / VRBO
          // booking that overlaps a direct reservation should stay visible
          // so the host sees the double-booking).
          const blocks = dayHasBlocks(iso)

          // Edge styling : leftmost cells of each week
          const isWeekStart = idx % 7 === 0
          // Bottom border : last row's bottom-border is handled by the section border
          const isLastRow = idx >= 35

          return (
            <DayCell
              key={iso}
              day={day}
              iso={iso}
              inMonth={inMonth}
              isToday={isToday}
              reservation={reservation}
              blocks={blocks}
              borderRight={(idx + 1) % 7 !== 0}
              borderBottom={!isLastRow}
              isWeekStart={isWeekStart}
            />
          )
        })}
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────── */

interface DayCellProps {
  day: Date
  iso: string
  inMonth: boolean
  isToday: boolean
  reservation?: CalendarReservation
  blocks: CalendarBlock[]
  borderRight: boolean
  borderBottom: boolean
  isWeekStart: boolean
}

function DayCell({
  day,
  iso,
  inMonth,
  isToday,
  reservation,
  blocks,
  borderRight,
  borderBottom,
}: DayCellProps) {
  const dayNumber = day.getUTCDate()

  const baseClasses = [
    'relative min-h-[108px] p-1.5 font-sans text-xs',
    inMonth ? 'bg-white' : 'bg-pearl-300/30',
    borderRight ? 'border-r border-pearl-400' : '',
    borderBottom ? 'border-b border-pearl-400' : '',
  ].join(' ')

  const dayLabel = (
    <span
      className={[
        'inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1',
        'text-[11px] font-semibold',
        isToday
          ? 'bg-gold text-midnight'
          : inMonth
            ? 'text-midnight'
            : 'text-midnight-300',
      ].join(' ')}
    >
      {dayNumber}
    </span>
  )

  // Up to two visible bars — one for the direct reservation (if any) and one
  // for the first external block (if any). Additional blocks become a
  // "+N" pill at the end. Empty days fall back to the "Available" hint.
  const hasReservation = !!reservation
  const hasBlock = blocks.length > 0
  const extraBlockCount = Math.max(0, blocks.length - 1)
  const isEmpty = !hasReservation && !hasBlock

  return (
    <div className={baseClasses}>
      {dayLabel}

      {hasReservation ? (
        <ReservationBar reservation={reservation} />
      ) : null}

      {hasBlock ? (
        <>
          <BlockBar block={blocks[0]!} compact={hasReservation} />
          {extraBlockCount > 0 ? (
            <span
              title={blocks
                .slice(1)
                .map((b) => blockStyle(b.source).label)
                .join(', ')}
              className="mt-0.5 inline-flex rounded-md bg-midnight/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-midnight"
            >
              +{extraBlockCount}
            </span>
          ) : null}
        </>
      ) : null}

      {isEmpty && inMonth ? (
        <span className="mt-1 block text-[10px] uppercase tracking-wide text-leaf/70">
          Disponible
        </span>
      ) : null}
    </div>
  )
}

function ReservationBar({ reservation }: { reservation: CalendarReservation }) {
  const style = RESERVATION_STYLE[reservation.payment_status]
  const tooltip = `${reservation.guest_name ?? 'Unknown guest'} · ${reservation.num_guests} guest${reservation.num_guests !== 1 ? 's' : ''} · ${reservation.reservation_ref} · ${reservation.payment_status}`
  return (
    <Link
      href={`/admin/reservations/${reservation.id}`}
      title={tooltip}
      className={[
        'mt-1 block truncate rounded-md px-1.5 py-0.5',
        'font-medium leading-tight',
        style.bar,
        'transition-opacity hover:opacity-90',
      ].join(' ')}
    >
      {reservation.guest_name ?? reservation.reservation_ref}
    </Link>
  )
}

function BlockBar({
  block,
  compact = false,
}: {
  block: CalendarBlock
  compact?: boolean
}) {
  const style = blockStyle(block.source)
  const tooltip = `${style.label}${block.reason ? ` — ${block.reason}` : ''} · ${block.blocked_from} → ${block.blocked_to}`
  return (
    <span
      title={tooltip}
      className={[
        compact ? 'mt-0.5' : 'mt-1',
        'block truncate rounded-md px-1.5 py-0.5',
        'leading-tight cursor-default',
        style.bar,
      ].join(' ')}
    >
      {style.label}
    </span>
  )
}

/* ───────────────────────────────────────────────────────────── */

function Legend() {
  const items: { dot: string; label: string }[] = [
    { dot: RESERVATION_STYLE.fully_paid.dot, label: 'Paid' },
    { dot: RESERVATION_STYLE.deposit_paid.dot, label: 'Deposit' },
    { dot: RESERVATION_STYLE.pending.dot, label: 'Pending' },
    { dot: BLOCK_STYLE.airbnb!.dot, label: 'Airbnb' },
    { dot: BLOCK_STYLE.booking!.dot, label: 'Booking' },
    { dot: BLOCK_STYLE.vrbo!.dot, label: 'VRBO' },
    { dot: BLOCK_STYLE.owner!.dot, label: 'Owner' },
    { dot: BLOCK_STYLE.maintenance!.dot, label: 'Maintenance' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 font-sans text-[11px] text-midnight-400">
          <span className={`h-2.5 w-2.5 rounded-full ${it.dot}`} aria-hidden="true" />
          {it.label}
        </span>
      ))}
    </div>
  )
}
