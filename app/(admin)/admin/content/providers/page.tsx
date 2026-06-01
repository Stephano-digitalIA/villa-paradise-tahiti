import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProviderActiveToggle } from './ProviderActiveToggle'

export const metadata: Metadata = { title: 'Providers — Admin' }
export const dynamic = 'force-dynamic'

export default async function ProvidersPage() {
  const { data } = await adminClient
    .from('excursion_providers')
    .select('*')
    .order('name', { ascending: true })

  const providers = data ?? []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Excursion Providers</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">{providers.length} providers</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/content/providers/new">+ Add Provider</Link>
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">No providers yet.</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">Click + to create your first one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pearl-400 bg-pearl-300/40">
                  {['Nom', 'Email', 'Téléphone', 'Services', 'Actif', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={idx < providers.length - 1 ? 'border-b border-pearl-400' : ''}
                  >
                    <td className="px-5 py-4 font-sans text-sm font-medium text-midnight">{p.name}</td>
                    <td className="px-5 py-4 font-sans text-sm text-midnight-400">
                      {p.contact_email ?? '—'}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-midnight-400">
                      {p.contact_phone ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.services ?? []).slice(0, 3).map((s: string) => (
                          <Badge key={s} size="sm">
                            {s}
                          </Badge>
                        ))}
                        {(p.services ?? []).length > 3 && (
                          <Badge size="sm">+{(p.services ?? []).length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ProviderActiveToggle id={p.id} active={p.active} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/content/providers/${p.id}`}
                        className="font-sans text-xs font-medium text-gold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
