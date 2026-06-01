import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { adminClient } from '@/lib/supabase/admin'
import type {
  CustomerNote,
  CustomerSummary,
  CustomerTag,
  EmailLog,
  Reservation,
} from '@/lib/supabase/types'
import { ClientEmailsTab } from '@/components/admin/clients/ClientEmailsTab'
import { ClientNotesTab } from '@/components/admin/clients/ClientNotesTab'
import { ClientPrefsTab } from '@/components/admin/clients/ClientPrefsTab'
import { ClientProfileCard } from '@/components/admin/clients/ClientProfileCard'
import { ClientStaysTab } from '@/components/admin/clients/ClientStaysTab'
import { ClientTabs, type ClientTab } from '@/components/admin/clients/ClientTabs'

export const dynamic = 'force-dynamic'

const VALID_TABS = new Set<ClientTab>(['stays', 'notes', 'emails', 'prefs'])

type PageProps = {
  params: { id: string }
  searchParams: { tab?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await adminClient
    .from('customer_summary')
    .select('first_name, last_name, anonymized_at')
    .eq('id', params.id)
    .maybeSingle()

  const name = data
    ? data.anonymized_at
      ? '[Anonymized]'
      : `${data.first_name} ${data.last_name}`.trim()
    : 'Client'
  return {
    title: `${name} — Villa Paradise Tahiti Admin`,
    robots: { index: false, follow: false },
  }
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: PageProps) {
  const active: ClientTab =
    searchParams.tab && VALID_TABS.has(searchParams.tab as ClientTab)
      ? (searchParams.tab as ClientTab)
      : 'stays'

  // ─── Fetch customer (from view to get aggregated fields) ─────────
  const { data: customer } = await adminClient
    .from('customer_summary')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!customer) notFound()

  const summary = customer as CustomerSummary

  // ─── Fetch reservations + notes + emails + tags catalog in parallel ─
  const [resvRes, notesRes, emailsRes, tagsRes] = await Promise.all([
    adminClient
      .from('reservations')
      .select('*')
      .eq('customer_id', summary.id)
      .order('check_in', { ascending: false }),
    adminClient
      .from('customer_notes')
      .select('*, admin_users(full_name, email)')
      .eq('customer_id', summary.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    adminClient
      .from('email_logs')
      .select('*')
      .or(`customer_id.eq.${summary.id},recipient_email.eq.${summary.email}`)
      .order('sent_at', { ascending: false })
      .limit(50),
    adminClient
      .from('customer_tags')
      .select('*')
      .order('label', { ascending: true }),
  ])

  const reservations = (resvRes.data ?? []) as Reservation[]
  const notes = ((notesRes.data ?? []) as Array<
    CustomerNote & { admin_users: { full_name: string | null; email: string } | null }
  >).map((n) => ({
    ...n,
    author_name: n.admin_users?.full_name ?? n.admin_users?.email ?? null,
  }))
  const emails = (emailsRes.data ?? []) as EmailLog[]
  const allTags = (tagsRes.data ?? []) as CustomerTag[]

  return (
    <div className="p-8">
      {/* ─── Breadcrumb + back ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-midnight-400 hover:text-midnight"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Clients
        </Link>
        <span className="font-sans text-sm text-midnight-400">/</span>
        <span className="font-sans text-sm font-medium text-midnight truncate">
          {summary.anonymized_at
            ? '[Anonymized]'
            : `${summary.first_name} ${summary.last_name}`.trim()}
        </span>
      </div>

      {/* ─── Layout 2 colonnes desktop ────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ClientProfileCard customer={summary} allTags={allTags} />
        </div>

        <div className="lg:col-span-8">
          <ClientTabs
            customerId={summary.id}
            active={active}
            counts={{
              stays: reservations.length,
              notes: notes.length,
              emails: emails.length,
            }}
          />
          <div className="mt-6">
            {active === 'stays' ? (
              <ClientStaysTab reservations={reservations} />
            ) : active === 'notes' ? (
              <ClientNotesTab customerId={summary.id} notes={notes} />
            ) : active === 'emails' ? (
              <ClientEmailsTab emails={emails} />
            ) : (
              <ClientPrefsTab customer={summary} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
