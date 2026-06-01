/**
 * iCal persistence — Villa Paradise Tahiti
 *
 * Bridges the in-memory parsed ranges (one per VEVENT) and the Supabase
 * `blocked_dates` table so the admin calendar and the CRM link panel see
 * the same source of truth.
 *
 * Strategy per source (airbnb / vrbo / booking):
 *   1. UPSERT each iCal range by `(source, source_ref = UID)` — keeps
 *      existing rows when dates haven't changed and refreshes them when
 *      they have.
 *   2. DELETE rows that belong to this source but whose `source_ref` is
 *      no longer present in the latest feed — handles cancellations.
 *
 * Rows with `source IN ('direct_booking','owner','maintenance')` are
 * never touched here — they're owned by the payment webhooks and the
 * admin manual flow.
 */

import { adminClient } from '@/lib/supabase/admin'

import type { IcalSource, RawRangesBySource } from './index'
import type { BlockedDateRange } from './types'

export interface SyncResult {
  /** Per-source counts after the sync ran. */
  perSource: Record<IcalSource, {
    upserted: number
    deleted: number
    skippedNoUid: number
  }>
  /** Wall-clock total ms (server-side). */
  durationMs: number
}

/**
 * Replace the persisted state of `airbnb`, `vrbo`, `booking` with the
 * ranges currently in the feeds. Idempotent — running this twice in a
 * row produces no DB changes the second time.
 */
export async function syncBlockedDatesToDatabase(
  raw: RawRangesBySource,
): Promise<SyncResult> {
  const start = Date.now()
  const perSource = {
    airbnb: { upserted: 0, deleted: 0, skippedNoUid: 0 },
    vrbo: { upserted: 0, deleted: 0, skippedNoUid: 0 },
    booking: { upserted: 0, deleted: 0, skippedNoUid: 0 },
  } as SyncResult['perSource']

  for (const source of ['airbnb', 'vrbo', 'booking'] as const) {
    const ranges = raw[source]
    const { upserted, deleted, skippedNoUid } = await syncOneSource(
      source,
      ranges,
    )
    perSource[source] = { upserted, deleted, skippedNoUid }
  }

  return { perSource, durationMs: Date.now() - start }
}

async function syncOneSource(
  source: IcalSource,
  ranges: BlockedDateRange[],
): Promise<{ upserted: number; deleted: number; skippedNoUid: number }> {
  // Drop ranges without a stable UID — without one we can't upsert
  // safely (they would be inserted as duplicates on every sync).
  const withUid = ranges.filter((r): r is BlockedDateRange & { uid: string } =>
    typeof r.uid === 'string' && r.uid.length > 0,
  )
  const skippedNoUid = ranges.length - withUid.length

  // ─── 1. UPSERT ─────────────────────────────────────────────
  let upserted = 0
  if (withUid.length > 0) {
    const rows = withUid.map((r) => ({
      source,
      source_ref: r.uid,
      blocked_from: r.start,
      blocked_to: r.end,
      reason: r.summary ?? null,
    }))

    const { error, count } = await adminClient
      .from('blocked_dates')
      .upsert(rows, {
        onConflict: 'source,source_ref',
        count: 'exact',
      })

    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[ical:persist:${source}] upsert failed:`, error)
    } else {
      upserted = count ?? rows.length
    }
  }

  // ─── 2. DELETE stale rows (UIDs no longer in feed) ─────────
  let deleted = 0
  const currentUids = withUid.map((r) => r.uid)

  if (currentUids.length === 0) {
    // No current rows from this source — clear everything we previously
    // wrote for it. (`source_ref IS NOT NULL` keeps manual entries safe
    // even if the schema ever allowed mixing sources, which it doesn't.)
    const { error, count } = await adminClient
      .from('blocked_dates')
      .delete({ count: 'exact' })
      .eq('source', source)
      .not('source_ref', 'is', null)
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[ical:persist:${source}] full-clear failed:`, error)
    } else {
      deleted = count ?? 0
    }
  } else {
    // Delete rows from this source whose source_ref is not in the new set.
    const { error, count } = await adminClient
      .from('blocked_dates')
      .delete({ count: 'exact' })
      .eq('source', source)
      .not('source_ref', 'is', null)
      .not('source_ref', 'in', `(${currentUids.map(quote).join(',')})`)
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[ical:persist:${source}] delete-stale failed:`, error)
    } else {
      deleted = count ?? 0
    }
  }

  return { upserted, deleted, skippedNoUid }
}

/** Quote a UID for inline SQL IN(...). UIDs are opaque strings, escape quotes. */
function quote(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`
}
