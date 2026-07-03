import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { ContactInquiry } from '@/lib/supabase/types'
import { InquiryActions } from './_components/InquiryActions'

export const metadata: Metadata = {
  title: 'Demandes de contact — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const { data: inquiries } = await adminClient
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const all = (inquiries ?? []) as ContactInquiry[]

  const unrepliedCount = all.filter((i) => !i.replied).length

  const filter = searchParams.filter ?? 'all'
  const filtered =
    filter === 'unreplied'
      ? all.filter((i) => !i.replied)
      : filter === 'replied'
      ? all.filter((i) => i.replied)
      : all

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold text-midnight">
              Demandes de contact
            </h1>
            {unrepliedCount > 0 && (
              <Badge variant="warning">{unrepliedCount} sans réponse</Badge>
            )}
          </div>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            {all.length} demande{all.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2 border-b border-pearl-400">
        {[
          { value: 'all', label: `Toutes (${all.length})` },
          {
            value: 'unreplied',
            label: `Sans réponse (${unrepliedCount})`,
          },
          {
            value: 'replied',
            label: `Répondues (${all.length - unrepliedCount})`,
          },
        ].map((tab) => (
          <a
            key={tab.value}
            href={
              tab.value === 'all'
                ? '/admin/inquiries'
                : `/admin/inquiries?filter=${tab.value}`
            }
            className={`pb-3 pt-2 font-sans text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'border-b-2 border-gold text-midnight'
                : 'text-midnight-400 hover:text-midnight'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Inquiry cards */}
      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
            <p className="font-heading text-lg text-midnight-400">
              Aucune demande ici
            </p>
            <p className="mt-1 font-sans text-sm text-midnight-400">
              {filter === 'unreplied'
                ? 'Toutes les demandes ont reçu une réponse !'
                : 'Les demandes apparaîtront ici dès qu’un client vous contacte.'}
            </p>
          </div>
        ) : (
          filtered.map((inquiry) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
            />
          ))
        )}
      </div>
    </div>
  )
}

function InquiryCard({ inquiry }: { inquiry: ContactInquiry }) {
  const truncatedMessage =
    inquiry.message.length > 200
      ? inquiry.message.slice(0, 200) + '...'
      : inquiry.message

  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Contact info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-base font-semibold text-midnight">
              {inquiry.full_name}
            </p>
            <Badge
              variant={inquiry.replied ? 'success' : 'warning'}
              size="sm"
            >
              {inquiry.replied ? 'Répondu' : 'En attente'}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 font-sans text-sm text-midnight-400">
            <a
              href={`mailto:${inquiry.email}`}
              className="hover:text-lagoon hover:underline"
            >
              {inquiry.email}
            </a>
            {inquiry.phone && <span>{inquiry.phone}</span>}
          </div>

          {(inquiry.check_in || inquiry.check_out) && (
            <p className="mt-2 font-sans text-sm text-midnight">
              <span className="font-semibold">Dates demandées :</span>{' '}
              {inquiry.check_in
                ? new Date(inquiry.check_in).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '?'}
              {' → '}
              {inquiry.check_out
                ? new Date(inquiry.check_out).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '?'}
              {inquiry.guests && ` · ${inquiry.guests} voyageur${inquiry.guests !== 1 ? 's' : ''}`}
            </p>
          )}

          <p className="mt-3 font-sans text-sm text-midnight">
            {truncatedMessage}
          </p>

          <p className="mt-2 font-sans text-xs text-midnight-400">
            Reçu le {new Date(inquiry.created_at).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {inquiry.replied_at && (
              <> · Répondu le {new Date(inquiry.replied_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</>
            )}
          </p>
        </div>

        {/* Actions */}
        <InquiryActions
          inquiryId={inquiry.id}
          email={inquiry.email}
          guestName={inquiry.full_name}
          message={inquiry.message}
          replied={inquiry.replied}
        />
      </div>
    </div>
  )
}
