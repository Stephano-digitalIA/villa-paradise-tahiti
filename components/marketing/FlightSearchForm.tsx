'use client'

import Image from 'next/image'
import { useMemo, useState, type FormEvent } from 'react'
import { ExternalLink, MapPin, Plane } from 'lucide-react'

import { Button, DateField, Input } from '@/components/ui'

/**
 * Curated origin list — top 20 likely departure cities for Villa Paradise
 * Tahiti guests. Surfaced in a <datalist> so visitors get autocomplete on
 * city names; the form still accepts a raw 3-letter IATA code as a
 * fallback. Skyscanner itself handles any mismatch on arrival.
 */
const ORIGIN_SUGGESTIONS: ReadonlyArray<{ city: string; iata: string }> = [
  { city: 'Los Angeles', iata: 'LAX' },
  { city: 'San Francisco', iata: 'SFO' },
  { city: 'Seattle', iata: 'SEA' },
  { city: 'New York (JFK)', iata: 'JFK' },
  { city: 'New York (Newark)', iata: 'EWR' },
  { city: 'Boston', iata: 'BOS' },
  { city: 'Chicago', iata: 'ORD' },
  { city: 'Dallas', iata: 'DFW' },
  { city: 'Houston', iata: 'IAH' },
  { city: 'Miami', iata: 'MIA' },
  { city: 'Atlanta', iata: 'ATL' },
  { city: 'Denver', iata: 'DEN' },
  { city: 'Honolulu', iata: 'HNL' },
  { city: 'Vancouver', iata: 'YVR' },
  { city: 'Toronto', iata: 'YYZ' },
  { city: 'Paris (CDG)', iata: 'CDG' },
  { city: 'London (LHR)', iata: 'LHR' },
  { city: 'Tokyo (HND)', iata: 'HND' },
  { city: 'Sydney', iata: 'SYD' },
  { city: 'Auckland', iata: 'AKL' },
] as const

const IATA_BY_CITY = new Map(
  ORIGIN_SUGGESTIONS.map((o) => [o.city.toLowerCase(), o.iata]),
)

/**
 * Skyscanner deep-link helpers.
 *
 * Skyscanner expects dates in `YYMMDD` and IATA codes lowercased in the
 * URL path. The destination is `ppt` — Faa'a International (Tahiti).
 * Moorea (MOZ) is reachable from PPT in a 15-min hop, so we anchor the
 * search on the main international gateway.
 *
 * Note: an earlier draft used `ppta` ("any airport") but Skyscanner
 * returns a 404 for that suffix on this route — `ppt` is the canonical
 * code and yields the expected search page.
 */
const DESTINATION_CODE = 'ppt'
const SKYSCANNER_BASE = 'https://www.skyscanner.com/transport/flights'

function toYyMmDd(iso: string): string {
  // iso is `YYYY-MM-DD` from the native <input type="date">
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d || y.length !== 4) return ''
  return `${y.slice(2)}${m}${d}`
}

/**
 * Resolve the user input to an IATA code:
 *   1. If it's already 3 letters, take it as-is (uppercased then lowercased
 *      for the URL).
 *   2. If it matches a known city label in our datalist, use the paired IATA.
 *   3. Otherwise, fall back to the raw text — Skyscanner's URL parser is
 *      forgiving and will route the visitor to a search page rather than
 *      a 404.
 */
function resolveOriginCode(raw: string): string {
  const trimmed = raw.trim()
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toLowerCase()
  const fromCity = IATA_BY_CITY.get(trimmed.toLowerCase())
  if (fromCity) return fromCity.toLowerCase()
  // Last-resort: strip spaces, lowercase, hope for the best.
  return trimmed.toLowerCase().replace(/\s+/g, '-')
}

function buildSkyscannerUrl(args: {
  origin: string
  departure: string
  returnDate: string
  adults: number
}): string {
  const origin = resolveOriginCode(args.origin)
  const dep = toYyMmDd(args.departure)
  const ret = toYyMmDd(args.returnDate)

  const path = `${SKYSCANNER_BASE}/${origin}/${DESTINATION_CODE}/${dep}/${ret}/`

  const params = new URLSearchParams({
    adultsv2: String(args.adults),
    childrenv2: '',
    inboundaltsenabled: 'false',
    outboundaltsenabled: 'false',
    preferdirects: 'false',
  })

  const affiliateId = process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID
  if (affiliateId) params.set('associateid', affiliateId)

  return `${path}?${params.toString()}`
}

/**
 * FlightSearchForm — public-side mini search that deep-links to
 * Skyscanner in a new tab.
 *
 * Design intent: we do NOT embed Skyscanner's widget. The visitor
 * submits a tiny native form, we construct an affiliate-tagged URL,
 * and `window.open` hands them off. Result: zero third-party JS on our
 * page, no consent banner additions, and the brand stays luxe.
 */
export function FlightSearchForm() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const oneWeekOut = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 10)
  }, [])

  const [origin, setOrigin] = useState('')
  const [departure, setDeparture] = useState(today)
  const [returnDate, setReturnDate] = useState(oneWeekOut)
  const [adults, setAdults] = useState(2)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!origin.trim()) {
      setError('Please enter your departure city or airport code.')
      return
    }
    if (!departure || !returnDate) {
      setError('Please select both departure and return dates.')
      return
    }
    if (returnDate < departure) {
      setError('Return date must be on or after the departure date.')
      return
    }

    const url = buildSkyscannerUrl({ origin, departure, returnDate, adults })

    // Skyscanner blocks iframe embeds (X-Frame-Options), so a true
    // in-page modal is impossible. The closest UX is a focused popup
    // window centred on the user's screen — 1100×720 fits the search
    // results layout without filling the screen. `popup=yes` tells
    // Chromium-based browsers to treat this as a chromeless popup
    // rather than a full tab.
    const w = 1100
    const h = 720
    const left =
      typeof window !== 'undefined'
        ? Math.max(0, Math.round((window.screen.availWidth - w) / 2))
        : 100
    const top =
      typeof window !== 'undefined'
        ? Math.max(0, Math.round((window.screen.availHeight - h) / 2))
        : 60
    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      'popup=yes',
      'noopener',
      'noreferrer',
      'menubar=no',
      'toolbar=no',
      'location=yes',
      'status=no',
      'resizable=yes',
      'scrollbars=yes',
    ].join(',')

    const popup = window.open(url, 'skyscanner-search', features)
    // Popup blockers can return null — fall back to a regular new tab.
    if (!popup) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      popup.focus()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border-2 border-lagoon/60 bg-pearl p-6 shadow-card sm:p-8"
      aria-label="Search flights to Tahiti on Skyscanner"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Plane className="h-5 w-5 text-gold" aria-hidden="true" />
          <h3 className="font-heading text-h3-luxe font-medium text-midnight">
            Find your flight to Tahiti
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-midnight-300">
            Powered by
          </span>
          <Image
            src="/logos/partners/skyscanner.svg"
            alt="Skyscanner"
            width={140}
            height={28}
            className="h-6 w-auto"
            priority={false}
          />
        </div>
      </div>

      <p className="mb-2 font-sans text-body-sm text-midnight-400">
        We&apos;ll open Skyscanner in a new tab pre-filled with your search.
        Tahiti&apos;s international airport (PPT) is in Faa&apos;a, a 25-minute
        drive from the villa.
      </p>

      <p className="mb-6 font-sans text-xs italic text-midnight-300">
        Fare comparison defaults to{' '}
        <span className="font-semibold not-italic text-midnight-400">
          Economy
        </span>{' '}
        class — switch to Premium Economy, Business or First on the
        Skyscanner page if you prefer.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Origin */}
        <div className="sm:col-span-2">
          <label
            htmlFor="flight-origin"
            className="mb-2 block font-sans text-body-sm font-medium text-midnight"
          >
            From
          </label>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300"
              aria-hidden="true"
            />
            <Input
              id="flight-origin"
              list="flight-origin-options"
              type="text"
              autoComplete="off"
              placeholder="Los Angeles, Paris, JFK…"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-9"
            />
            <datalist id="flight-origin-options">
              {ORIGIN_SUGGESTIONS.map((o) => (
                <option key={o.iata} value={o.city}>
                  {o.iata}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Departure */}
        <div>
          <label
            htmlFor="flight-departure"
            className="mb-2 block font-sans text-body-sm font-medium text-midnight"
          >
            Departure
          </label>
          <DateField
            id="flight-departure"
            value={departure}
            onChange={setDeparture}
            min={today}
            aria-label="Choose a departure date"
          />
        </div>

        {/* Return */}
        <div>
          <label
            htmlFor="flight-return"
            className="mb-2 block font-sans text-body-sm font-medium text-midnight"
          >
            Return
          </label>
          <DateField
            id="flight-return"
            value={returnDate}
            onChange={setReturnDate}
            min={departure || today}
            aria-label="Choose a return date"
          />
        </div>

        {/* Adults */}
        <div className="sm:col-span-2">
          <label
            htmlFor="flight-adults"
            className="mb-2 block font-sans text-body-sm font-medium text-midnight"
          >
            Travelers
          </label>
          <select
            id="flight-adults"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="flex h-12 w-full rounded-lg border-2 border-midnight/25 bg-white px-4 py-3 font-sans text-body-md text-midnight transition-colors duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} adult{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 font-sans text-body-sm text-coral">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-body-sm text-midnight-300">
          Opens in a focused popup window
        </p>
        <Button type="submit" variant="primary" size="lg">
          Find flights
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
