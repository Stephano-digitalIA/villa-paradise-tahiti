import Link from 'next/link'

import type { CustomerSummary } from '@/lib/supabase/types'

interface ClientsListTableProps {
  rows: CustomerSummary[]
}

const SOURCE_DOT: Record<string, string> = {
  direct: 'bg-leaf',
  airbnb: 'bg-coral',
  booking: 'bg-lagoon',
  vrbo: 'bg-lagoon',
  referral: 'bg-gold',
  manual: 'bg-midnight',
  imported: 'bg-midnight-400',
}

export function ClientsListTable({ rows }: ClientsListTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
        <p className="font-heading text-lg text-midnight-400">No clients found</p>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          Try adjusting your filters or create one from the button above.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="border-b border-pearl-400 bg-pearl-300/40">
              {[
                '',
                'Name',
                'Email',
                'Phone',
                'Country',
                'Tags',
                'Stays',
                'Revenue',
                'Last stay',
                'Source',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c, idx) => {
              const isLast = idx === rows.length - 1
              const isAnon = !!c.anonymized_at
              return (
                <tr
                  key={c.id}
                  className={
                    'transition-colors hover:bg-pearl-300/20 ' +
                    (isLast ? '' : 'border-b border-pearl-400')
                  }
                >
                  <td className="px-4 py-4">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-semibold text-midnight"
                    >
                      {(c.first_name?.[0] ?? '?').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-sans text-sm font-medium text-midnight hover:text-gold"
                    >
                      {isAnon ? '[Anonymized]' : `${c.first_name} ${c.last_name}`}
                    </Link>
                  </td>
                  <td className="px-4 py-4 font-sans text-sm text-midnight-400">
                    {isAnon ? '—' : c.email}
                  </td>
                  <td className="px-4 py-4 font-sans text-sm text-midnight-400">
                    {isAnon ? '—' : c.phone ?? '—'}
                  </td>
                  <td className="px-4 py-4 font-sans text-sm text-midnight-400">
                    {c.country ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    {c.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex rounded-full bg-gold/10 px-2 py-0.5 font-sans text-xs font-medium text-midnight"
                          >
                            {t}
                          </span>
                        ))}
                        {c.tags.length > 3 ? (
                          <span className="font-sans text-xs text-midnight-400">
                            +{c.tags.length - 3}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-midnight-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-sans text-sm font-semibold text-midnight">
                    {c.n_stays}
                  </td>
                  <td className="px-4 py-4 font-display italic text-gold">
                    {formatUSD(c.total_revenue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-sans text-sm text-midnight-400">
                    {c.last_check_in ? formatDate(c.last_check_in) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {c.acquisition_source ? (
                      <span className="inline-flex items-center gap-1.5 font-sans text-xs text-midnight-400">
                        <span
                          className={
                            'h-2 w-2 rounded-full ' +
                            (SOURCE_DOT[c.acquisition_source] ?? 'bg-midnight-400')
                          }
                        />
                        {c.acquisition_source}
                      </span>
                    ) : (
                      <span className="text-midnight-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-sans text-sm font-medium text-gold hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
