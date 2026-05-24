import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import type { ContactInquiry } from '@/lib/supabase/types'
import { InquiriesClient } from './_components/InquiriesClient'

export const metadata: Metadata = {
  title: 'Inquiries — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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
              Contact Inquiries
            </h1>
            {unrepliedCount > 0 && (
              <Badge variant="warning">{unrepliedCount} unreplied</Badge>
            )}
          </div>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            {all.length} total inquiry{all.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2 border-b border-pearl-400">
        {[
          { value: 'all', label: `All (${all.length})` },
          {
            value: 'unreplied',
            label: `Unreplied (${unrepliedCount})`,
          },
          {
            value: 'replied',
            label: `Replied (${all.length - unrepliedCount})`,
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
              No inquiries here
            </p>
            <p className="mt-1 font-sans text-sm text-midnight-400">
              {filter === 'unreplied'
                ? 'All inquiries have been replied to!'
                : 'Inquiries will appear here once guests contact you.'}
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

  const mailtoSubject = encodeURIComponent(
    'Re: Villa Paradise Tahiti — Your inquiry',
  )

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
              {inquiry.replied ? 'Replied' : 'Pending'}
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
              <span className="font-semibold">Requested dates:</span>{' '}
              {inquiry.check_in
                ? new Date(inquiry.check_in).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '?'}
              {' → '}
              {inquiry.check_out
                ? new Date(inquiry.check_out).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '?'}
              {inquiry.guests && ` · ${inquiry.guests} guest${inquiry.guests !== 1 ? 's' : ''}`}
            </p>
          )}

          <p className="mt-3 font-sans text-sm text-midnight">
            {truncatedMessage}
          </p>

          <p className="mt-2 font-sans text-xs text-midnight-400">
            Received {new Date(inquiry.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {inquiry.replied_at && (
              <> · Replied {new Date(inquiry.replied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <a
            href={`mailto:${inquiry.email}?subject=${mailtoSubject}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-midnight px-4 py-2 font-sans text-sm font-medium text-pearl transition-opacity hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Reply
          </a>
          {!inquiry.replied && (
            <InquiriesClient inquiryId={inquiry.id} />
          )}
        </div>
      </div>
    </div>
  )
}
