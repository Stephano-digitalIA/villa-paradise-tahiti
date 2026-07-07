import { AlertCircle, CheckCircle2, Mail, XCircle } from 'lucide-react'

import type { EmailLog, EmailLogStatus } from '@/lib/supabase/types'

interface ClientEmailsTabProps {
  emails: EmailLog[]
}

const STATUS_STYLE: Record<
  EmailLogStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  sent: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Distribué',
    color: 'text-leaf',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    label: 'Échec',
    color: 'text-coral',
  },
  bounced: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Rejeté',
    color: 'text-coral',
  },
}

export function ClientEmailsTab({ emails }: ClientEmailsTabProps) {
  if (emails.length === 0) {
    return (
      <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
        <Mail className="mx-auto h-8 w-8 text-midnight-400" aria-hidden="true" />
        <p className="mt-3 font-heading text-lg text-midnight-400">
          Aucun e-mail pour l&apos;instant
        </p>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          Les e-mails transactionnels et personnalisés envoyés à ce client apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-pearl-400 bg-pearl-300/40">
              {['Type', 'Destinataire', 'Statut', 'Envoyé le'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emails.map((e, idx) => {
              const s = STATUS_STYLE[e.status]
              return (
                <tr
                  key={e.id}
                  className={
                    'transition-colors hover:bg-pearl-300/20 ' +
                    (idx < emails.length - 1 ? 'border-b border-pearl-400' : '')
                  }
                >
                  <td className="px-4 py-3.5 font-sans text-sm font-medium text-midnight">
                    {formatType(e.email_type)}
                  </td>
                  <td className="px-4 py-3.5 font-sans text-sm text-midnight-400">
                    {e.recipient_email}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 font-sans text-sm ${s.color}`}
                    >
                      {s.icon}
                      {s.label}
                    </span>
                    {e.error_message ? (
                      <p className="mt-0.5 font-sans text-xs text-coral">
                        {e.error_message}
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-sans text-xs text-midnight-400">
                    {formatDateTime(e.sent_at)}
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

function formatType(slug: string): string {
  return slug
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
