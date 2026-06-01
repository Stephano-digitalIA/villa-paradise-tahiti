'use client'

import { useState } from 'react'
import { CalendarPlus, Download, Mail, Trash2 } from 'lucide-react'

import { AnonymizeConfirmModal } from './AnonymizeConfirmModal'
import { EmailComposerDrawer } from './EmailComposerDrawer'

interface ClientActionsProps {
  customerId: string
  customerEmail: string
  customerFirstName: string
  customerDisplayName: string
  isAnonymized: boolean
  anonymizedAt: string | null
}

export function ClientActions({
  customerId,
  customerEmail,
  customerFirstName,
  customerDisplayName,
  isAnonymized,
  anonymizedAt,
}: ClientActionsProps) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [anonymizeOpen, setAnonymizeOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
          Actions
        </p>

        <ActionButton
          icon={<Mail className="h-4 w-4" />}
          label="Send an email"
          onClick={() => setEmailOpen(true)}
          disabled={isAnonymized}
          hint={isAnonymized ? 'Anonymized' : undefined}
        />

        <ActionButton
          icon={<CalendarPlus className="h-4 w-4" />}
          label="New reservation"
          disabled
          hint="Coming P5"
        />

        <ActionButton
          icon={<Download className="h-4 w-4" />}
          label="Export data (GDPR)"
          href={`/api/admin/clients/${customerId}/export`}
          download
        />

        <ActionButton
          icon={<Trash2 className="h-4 w-4 text-coral" />}
          label={isAnonymized ? 'Already anonymized' : 'Anonymize (GDPR)'}
          onClick={() => setAnonymizeOpen(true)}
          disabled={isAnonymized}
          hint={isAnonymized && anonymizedAt ? formatDate(anonymizedAt) : undefined}
          danger
        />
      </div>

      <EmailComposerDrawer
        customerId={customerId}
        customerEmail={customerEmail}
        customerFirstName={customerFirstName}
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
      />

      <AnonymizeConfirmModal
        customerId={customerId}
        customerName={customerDisplayName}
        open={anonymizeOpen}
        onClose={() => setAnonymizeOpen(false)}
      />
    </>
  )
}

/* ───────────────────────────────────────────────────────────── */

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
  download?: boolean
  disabled?: boolean
  hint?: string
  danger?: boolean
}

function ActionButton({
  icon,
  label,
  onClick,
  href,
  download,
  disabled,
  hint,
  danger,
}: ActionButtonProps) {
  const base =
    'inline-flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 font-sans text-sm font-medium transition-colors'
  const enabled = danger
    ? 'border-coral/40 text-coral hover:bg-coral/5'
    : 'border-pearl-400 text-midnight hover:border-midnight hover:bg-pearl-300/40'
  const disabledCls =
    'border-pearl-400 text-midnight-400 cursor-not-allowed bg-pearl-300/30'

  const inner = (
    <>
      <span className="inline-flex items-center gap-2">
        <span className={danger && !disabled ? 'text-coral' : 'text-gold'}>{icon}</span>
        {label}
      </span>
      {hint ? (
        <span className="font-sans text-[10px] uppercase tracking-wider text-midnight-400">
          {hint}
        </span>
      ) : null}
    </>
  )

  if (disabled) {
    return (
      <button type="button" disabled className={`${base} ${disabledCls}`}>
        {inner}
      </button>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        download={download}
        className={`${base} ${enabled}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${enabled}`}>
      {inner}
    </button>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
