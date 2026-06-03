'use client'

/**
 * DateField — controlled date input with a US-locale calendar dropdown.
 *
 * Replaces `<input type="date">` everywhere we need a guaranteed US
 * display format (mm/dd/yyyy) and an English calendar widget. Chrome's
 * native control follows the OS locale and ignores `lang="en-US"`, so
 * we render our own with `react-day-picker`.
 *
 * Props:
 *   - `value`: ISO `YYYY-MM-DD` string (empty = no selection)
 *   - `onChange`: receives the new ISO date (or `''` if cleared)
 *   - `min` / `max`: optional ISO bounds; dates outside are disabled
 *   - `disabledRanges`: optional ranges greyed out and non-selectable
 *     (used on the booking page to block Airbnb / owner periods)
 *   - `placeholder`: shown when empty (defaults to `mm/dd/yyyy`)
 *   - `error`: red border + ring
 */

import 'react-day-picker/style.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'

export interface DateFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  /**
   * Ranges that can't be selected. The optional `source` tag is used to
   * style them differently — a row with `source === 'turnover'` renders
   * in red (the 1-day cleaning block after every guest stay), everything
   * else renders in coral with a strikethrough.
   */
  disabledRanges?: ReadonlyArray<{ start: string; end: string; source?: string }>
  placeholder?: string
  error?: boolean
  className?: string
  /** Forwarded for screen-reader hint linking. */
  'aria-describedby'?: string
  /** Optional label for the calendar icon button (accessibility). */
  'aria-label'?: string
}

function toUsDisplay(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${m}/${d}/${y}`
}

function isoToDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  // Local time — DayPicker compares dates without time-of-day, and using
  // local-zone Date avoids "off by one" rendering in negative UTC offsets.
  return new Date(y, m - 1, d)
}

function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DateField({
  id,
  value,
  onChange,
  min,
  max,
  disabled = false,
  disabledRanges,
  placeholder = 'mm/dd/yyyy',
  error = false,
  className,
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Click outside closes the popover.
  useEffect(() => {
    if (!open) return
    function onDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const selected = isoToDate(value)
  const minDate = isoToDate(min)
  const maxDate = isoToDate(max)

  const disabledMatchers = useMemo(() => {
    const list: Array<unknown> = []
    if (minDate) list.push({ before: minDate })
    if (maxDate) list.push({ after: maxDate })
    for (const range of disabledRanges ?? []) {
      const from = isoToDate(range.start)
      const to = isoToDate(range.end)
      if (from && to) list.push({ from, to })
    }
    return list.length > 0 ? list : undefined
  }, [minDate, maxDate, disabledRanges])

  // Days that belong to a `source === 'turnover'` range — passed to
  // DayPicker as a custom modifier so the CSS can paint them red on
  // top of the default disabled styling.
  const turnoverModifier = useMemo(() => {
    const list: Array<{ from: Date; to: Date }> = []
    for (const range of disabledRanges ?? []) {
      if (range.source !== 'turnover') continue
      const from = isoToDate(range.start)
      const to = isoToDate(range.end)
      if (from && to) list.push({ from, to })
    }
    return list
  }, [disabledRanges])

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(dateToIso(date))
      setOpen(false)
    } else {
      onChange('')
    }
  }

  const display = value ? toUsDisplay(value) : ''

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-lg bg-white px-4 py-3',
          'border-2 border-midnight/25',
          'font-sans text-body-md text-left',
          'transition-colors duration-200',
          'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
          'disabled:cursor-not-allowed disabled:bg-pearl-300 disabled:opacity-60',
          error && 'border-coral focus:border-coral focus:ring-coral/30',
        )}
      >
        {display ? (
          <span className="font-mono text-midnight">{display}</span>
        ) : (
          <span className="text-midnight-300">{placeholder}</span>
        )}
        <CalendarIcon className="h-4 w-4 shrink-0 text-midnight-300" aria-hidden="true" />
      </button>

      {open && !disabled ? (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-pearl-400 bg-white p-2 shadow-elevated"
          // CSS variable overrides so the calendar matches the luxe palette
          // without us having to map every rdp-* class to Tailwind.
          style={
            {
              '--rdp-accent-color': '#C9A66B',
              '--rdp-accent-background-color': '#C9A66B',
              '--rdp-day-height': '2.25rem',
              '--rdp-day-width': '2.25rem',
              '--rdp-font-family': 'inherit',
            } as React.CSSProperties
          }
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? minDate ?? new Date()}
            disabled={disabledMatchers as never}
            modifiers={{ turnover: turnoverModifier as never }}
            modifiersClassNames={{ turnover: 'rdp-day-turnover' }}
            startMonth={minDate}
            endMonth={maxDate}
            showOutsideDays
            weekStartsOn={0}
          />
        </div>
      ) : null}
    </div>
  )
}
