/**
 * Aggregation for the admin analytics page. Server-only.
 *
 * Rows are read for the window and summed in JavaScript rather than in SQL.
 * A villa site produces thousands of events a month, not millions, so a
 * materialised summary would be premature; `MAX_ROWS` is the guard that keeps
 * that assumption from turning into a slow page if traffic ever surprises us.
 */
import { liveAdminClient } from '@/lib/supabase/admin'
import type { AnalyticsEvent } from '@/lib/supabase/types'

/** Above this the page says so rather than silently showing partial data. */
const MAX_ROWS = 50000

export interface Bar {
  label: string
  value: number
}

export interface FunnelStep {
  label: string
  visitors: number
  /** Share of the step before it. Null on the first step. */
  ofPrevious: number | null
}

export interface AnalyticsSummary {
  tableMissing: boolean
  truncated: boolean
  days: number
  from: string
  visitors: number
  pageViews: number
  perDay: Array<{ day: string; visitors: number; views: number }>
  funnel: FunnelStep[]
  topPages: Bar[]
  topPhotos: Bar[]
  sources: Bar[]
  countries: Bar[]
  devices: Bar[]
  business: {
    reservations: number
    paid: number
    revenueUSD: number
    inquiries: number
    subscribers: number
  }
}

/** Paths that define the booking funnel, in order. */
const FUNNEL: Array<{ label: string; match: (p: string) => boolean }> = [
  { label: 'Visite du site', match: () => true },
  { label: 'Page Tarifs ou Villa', match: (p) => p === '/rates' || p === '/villa' },
  { label: 'Réservation ouverte', match: (p) => p.startsWith('/booking') },
  { label: 'Paiement atteint', match: (p) => p === '/booking/checkout' },
  { label: 'Paiement confirmé', match: (p) => p === '/booking/success' },
]

const SOURCE_LABEL: Record<string, string> = {
  direct: 'Accès direct',
  search: 'Moteurs de recherche',
  social: 'Réseaux sociaux',
  referral: 'Sites référents',
}

const DEVICE_LABEL: Record<string, string> = {
  mobile: 'Mobile',
  tablet: 'Tablette',
  desktop: 'Ordinateur',
}

/** Distinct visitors, counted by the daily hash. */
function countVisitors(rows: AnalyticsEvent[]): number {
  return new Set(rows.map((r) => r.visitor_day)).size
}

function topOf(
  rows: AnalyticsEvent[],
  key: (r: AnalyticsEvent) => string | null,
  limit: number,
  label: (k: string) => string = (k) => k,
): Bar[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const k = key(r)
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, value]) => ({ label: label(k), value }))
}

export async function getAnalyticsSummary(days: number): Promise<AnalyticsSummary> {
  const from = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data, error } = await liveAdminClient
    .from('analytics_events')
    .select('*')
    .gte('occurred_at', from)
    .order('occurred_at', { ascending: true })
    .limit(MAX_ROWS)

  const empty: AnalyticsSummary = {
    tableMissing: Boolean(error),
    truncated: false,
    days,
    from,
    visitors: 0,
    pageViews: 0,
    perDay: [],
    funnel: [],
    topPages: [],
    topPhotos: [],
    sources: [],
    countries: [],
    devices: [],
    business: { reservations: 0, paid: 0, revenueUSD: 0, inquiries: 0, subscribers: 0 },
  }

  // Business figures come from tables that exist regardless of migration 019,
  // so they are worth showing even when the measurement table is missing.
  const business = await getBusiness(from)
  if (error) return { ...empty, business }

  const rows = (data ?? []) as AnalyticsEvent[]
  const views = rows.filter((r) => r.kind === 'page_view')
  const photos = rows.filter((r) => r.kind === 'photo_view')

  // One bucket per day in the window, including days with nothing, so the
  // trend line shows a gap as a gap rather than skipping it.
  const byDay = new Map<string, AnalyticsEvent[]>()
  for (let i = days - 1; i >= 0; i--) {
    byDay.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), [])
  }
  for (const r of views) {
    const day = r.occurred_at.slice(0, 10)
    byDay.get(day)?.push(r)
  }

  const funnel: FunnelStep[] = []
  for (const step of FUNNEL) {
    const visitors = countVisitors(views.filter((r) => step.match(r.path)))
    const previous = funnel[funnel.length - 1]?.visitors
    funnel.push({
      label: step.label,
      visitors,
      ofPrevious: previous && previous > 0 ? Math.round((visitors / previous) * 100) : null,
    })
  }

  return {
    tableMissing: false,
    truncated: rows.length >= MAX_ROWS,
    days,
    from,
    visitors: countVisitors(views),
    pageViews: views.length,
    perDay: [...byDay.entries()].map(([day, dayRows]) => ({
      day,
      visitors: countVisitors(dayRows),
      views: dayRows.length,
    })),
    funnel,
    topPages: topOf(views, (r) => r.path, 8),
    topPhotos: topOf(photos, (r) => r.label, 8),
    sources: topOf(views, (r) => r.source, 4, (k) => SOURCE_LABEL[k] ?? k),
    countries: topOf(views, (r) => r.country, 6),
    devices: topOf(views, (r) => r.device, 3, (k) => DEVICE_LABEL[k] ?? k),
    business,
  }
}

/** Figures already in the database, needing no measurement at all. */
async function getBusiness(from: string): Promise<AnalyticsSummary['business']> {
  const [res, inq, subs] = await Promise.all([
    liveAdminClient
      .from('reservations')
      .select('payment_status, total, deposit_amount, created_at')
      .gte('created_at', from),
    liveAdminClient.from('contact_inquiries').select('id').gte('created_at', from),
    liveAdminClient
      .from('newsletter_subscribers')
      .select('id')
      .gte('created_at', from),
  ])

  const reservations = (res.data ?? []) as Array<{
    payment_status: string | null
    total: number | null
    deposit_amount: number | null
  }>
  const paid = reservations.filter(
    (r) => r.payment_status === 'deposit_paid' || r.payment_status === 'paid',
  )

  return {
    reservations: reservations.length,
    paid: paid.length,
    // What was actually taken, not what the stays are worth: the deposit is
    // the money in hand, and counting the full total would flatter the figure.
    revenueUSD: paid.reduce((sum, r) => sum + (r.deposit_amount ?? 0), 0),
    inquiries: (inq.data ?? []).length,
    subscribers: (subs.data ?? []).length,
  }
}
