import type { Metadata } from 'next'
import Link from 'next/link'

import { adminClient } from '@/lib/supabase/admin'
import type {
  AcquisitionSource,
  CustomerSummary,
  CustomerTag,
} from '@/lib/supabase/types'
import { ClientFilters } from '@/components/admin/clients/ClientFilters'
import { ClientsListTable } from '@/components/admin/clients/ClientsListTable'
import { KpiCards, type KpiData } from '@/components/admin/clients/KpiCards'
import { NewClientButton } from '@/components/admin/clients/NewClientButton'

export const metadata: Metadata = {
  title: 'Clients — Villa Paradise Tahiti Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

type PageProps = {
  searchParams: {
    q?: string
    tag?: string
    source?: string
    page?: string
  }
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  // ─── KPIs + tags + filtered list in parallel ────────────────────
  const [kpis, tags, listResult] = await Promise.all([
    fetchKpis(),
    fetchTags(),
    fetchList({
      q: searchParams.q,
      tag: searchParams.tag,
      source: searchParams.source as AcquisitionSource | undefined,
      offset,
      limit: PAGE_SIZE,
    }),
  ])

  const { rows, count } = listResult
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  function buildUrl(p: number): string {
    const sp = new URLSearchParams()
    if (searchParams.q) sp.set('q', searchParams.q)
    if (searchParams.tag) sp.set('tag', searchParams.tag)
    if (searchParams.source) sp.set('source', searchParams.source)
    sp.set('page', String(p))
    return `/admin/clients?${sp.toString()}`
  }

  return (
    <div className="p-8">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">
            Clients
          </h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            {count.toLocaleString('fr-FR')} client{count !== 1 ? 's' : ''}, CRM unifié
            entre réservations directes et canaux externes.
          </p>
        </div>
        <NewClientButton />
      </div>

      {/* ─── KPIs ──────────────────────────────────────────────────── */}
      <div className="mt-6">
        <KpiCards data={kpis} />
      </div>

      {/* ─── Filters ───────────────────────────────────────────────── */}
      <div className="mt-6">
        <ClientFilters tags={tags} />
      </div>

      {/* ─── List ──────────────────────────────────────────────────── */}
      <div className="mt-4">
        <ClientsListTable rows={rows} />
      </div>

      {/* ─── Pagination ────────────────────────────────────────────── */}
      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <p className="font-sans text-sm text-midnight-400">
            Page {page} sur {totalPages}, {count} clients
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={buildUrl(page - 1)}
                className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
              >
                ← Précédent
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={buildUrl(page + 1)}
                className="rounded-xl border border-pearl-400 bg-white px-4 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
              >
                Suivant →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
 * Data fetchers
 * ─────────────────────────────────────────────────────────────── */

async function fetchKpis(): Promise<KpiData> {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const today = now.toISOString().slice(0, 10)
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)
    .toISOString()
    .slice(0, 10)

  const [
    { count: totalClients },
    { count: newThisMonth },
    { count: newPrevMonth },
    nextArrivalRes,
    topRevenueRes,
  ] = await Promise.all([
    adminClient
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .is('anonymized_at', null),
    adminClient
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstOfMonth),
    adminClient
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstOfPrevMonth)
      .lt('created_at', firstOfMonth),
    adminClient
      .from('reservations')
      .select('check_in, customers!inner(first_name, last_name)')
      .gte('check_in', today)
      .in('payment_status', ['deposit_paid', 'fully_paid'])
      .order('check_in', { ascending: true })
      .limit(1)
      .maybeSingle(),
    adminClient
      .from('reservations')
      .select('total')
      .gte('check_in', twelveMonthsAgo)
      .in('payment_status', ['deposit_paid', 'fully_paid'])
      .order('total', { ascending: false })
      .limit(10),
  ])

  const nextArrival = nextArrivalRes.data
    ? (() => {
        const c = (nextArrivalRes.data as unknown as {
          check_in: string
          customers: { first_name: string; last_name: string } | null
        }).customers
        const name = c ? `${c.first_name} ${c.last_name}`.trim() : 'Voyageur inconnu'
        return { name, date: (nextArrivalRes.data as { check_in: string }).check_in }
      })()
    : null

  const topRevenue12m =
    (topRevenueRes.data ?? []).reduce((acc, r) => acc + Number(r.total ?? 0), 0)

  return {
    totalClients: totalClients ?? 0,
    newThisMonth: newThisMonth ?? 0,
    newThisMonthDelta: (newThisMonth ?? 0) - (newPrevMonth ?? 0),
    nextArrival,
    topRevenue12m,
  }
}

async function fetchTags(): Promise<CustomerTag[]> {
  const { data } = await adminClient
    .from('customer_tags')
    .select('*')
    .order('label', { ascending: true })
  return (data ?? []) as CustomerTag[]
}

interface FetchListArgs {
  q?: string
  tag?: string
  source?: AcquisitionSource
  offset: number
  limit: number
}

async function fetchList({
  q,
  tag,
  source,
  offset,
  limit,
}: FetchListArgs): Promise<{ rows: CustomerSummary[]; count: number }> {
  // If a tag filter is active, we need ids of customers having that tag.
  let restrictIds: string[] | null = null
  if (tag) {
    const { data: tagRow } = await adminClient
      .from('customer_tags')
      .select('id')
      .eq('label', tag)
      .maybeSingle()

    if (!tagRow) return { rows: [], count: 0 }

    const { data: assignments } = await adminClient
      .from('customer_tag_assignments')
      .select('customer_id')
      .eq('tag_id', tagRow.id)
    restrictIds = (assignments ?? []).map((a) => a.customer_id)
    if (restrictIds.length === 0) return { rows: [], count: 0 }
  }

  let query = adminClient
    .from('customer_summary')
    .select('*', { count: 'exact' })
    .is('anonymized_at', null)
    .order('last_check_in', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (q) {
    const needle = q.trim()
    // Search across first_name, last_name, email, phone via OR
    query = query.or(
      `first_name.ilike.%${needle}%,last_name.ilike.%${needle}%,email.ilike.%${needle}%,phone.ilike.%${needle}%`,
    )
  }
  if (source) {
    query = query.eq('acquisition_source', source)
  }
  if (restrictIds) {
    query = query.in('id', restrictIds)
  }

  const { data, count } = await query.range(offset, offset + limit - 1)
  return { rows: (data ?? []) as CustomerSummary[], count: count ?? 0 }
}
