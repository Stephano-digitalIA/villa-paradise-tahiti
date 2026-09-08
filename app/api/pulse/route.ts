/**
 * POST /api/pulse — the audience beacon.
 *
 * Named `pulse` rather than `track` or `analytics` on purpose: content
 * blockers match those two words in a path and would drop a large share of
 * an otherwise honest, cookie-free, first-party count. Nothing here is
 * hidden from the visitor; the name only avoids a blocklist built for
 * third-party trackers.
 *
 * The body carries the path, the document referrer and, for a named event, a
 * label. The referrer has to come from the page: this request's own `referer`
 * header is the page the beacon fires from, which would make every visit look
 * direct. Country, device and the daily visitor hash are derived server-side
 * from request headers instead, where a client cannot forge them.
 *
 * Always answers 204, whatever happens. A measurement endpoint must never
 * turn into an error the visitor can see, and must never tell a caller
 * whether the table exists.
 */
import { adminClient } from '@/lib/supabase/admin'
import { safePath, visitContextFrom } from '@/lib/analytics/collect'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_CONTENT = new Response(null, { status: 204 })

/** Paths that measure nothing useful and would only add noise. */
function isIgnored(path: string): boolean {
  return (
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path === '/newsletter/unsubscribe'
  )
}

export async function POST(request: Request) {
  let path = '/'
  let kind = 'page_view'
  let label: string | null = null
  let referrer: string | null = null

  try {
    const body = (await request.json()) as {
      path?: unknown
      kind?: unknown
      label?: unknown
      ref?: unknown
    }
    if (typeof body.path !== 'string') return NO_CONTENT
    path = safePath(body.path)
    if (typeof body.kind === 'string' && body.kind.length <= 40) kind = body.kind
    if (typeof body.label === 'string' && body.label.trim()) {
      label = body.label.trim().slice(0, 160)
    }
    if (typeof body.ref === 'string' && body.ref.length <= 2048) referrer = body.ref
  } catch {
    return NO_CONTENT
  }

  if (isIgnored(path)) return NO_CONTENT

  let selfHost = 'villaparadisetahiti.com'
  try {
    selfHost = new URL(SITE_URL).hostname.replace(/^www\./, '')
  } catch {
    /* keep the default */
  }

  const context = visitContextFrom(request.headers, referrer, selfHost)

  try {
    await adminClient.from('analytics_events').insert({
      kind,
      path,
      label,
      source: context.source,
      referrer_host: context.referrerHost,
      country: context.country,
      device: context.device,
      visitor_day: context.visitorDay,
    })
  } catch {
    // Migration 019 not applied, or a transient failure. Losing a count is
    // never worth surfacing anything to the visitor.
  }

  return NO_CONTENT
}
