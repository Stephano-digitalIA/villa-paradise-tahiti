import { type ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// DataTable — reusable admin table wrapper
// ─────────────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: string
  label: string
  render: (row: T) => ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  loading?: boolean
  emptyMessage?: string
  emptySubtitle?: string
}

function Skeleton() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 animate-pulse rounded bg-pearl-400" />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T>({
  columns,
  rows,
  keyField,
  loading = false,
  emptyMessage = 'No items yet.',
  emptySubtitle = 'Click + to create your first one.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
      {/* Empty state */}
      {!loading && rows.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <p className="font-heading text-lg text-midnight-400">{emptyMessage}</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-pearl-400 bg-pearl-300/40">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400 ${col.className ?? ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                : rows.map((row, idx) => (
                    <tr
                      key={String(row[keyField])}
                      className={idx < rows.length - 1 ? 'border-b border-pearl-400' : ''}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-5 py-4 ${col.className ?? ''}`}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
