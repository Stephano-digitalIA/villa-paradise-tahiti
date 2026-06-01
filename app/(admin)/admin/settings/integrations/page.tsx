import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { IcalSyncButton } from '@/components/admin/IcalSyncButton'

export const metadata: Metadata = {
  title: 'Intégrations — Villa Paradise Tahiti Admin',
}

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  // Find last iCal sync timestamp (most recent blocked_date with source 'airbnb')
  const { data: lastAirbnbBlock } = await adminClient
    .from('blocked_dates')
    .select('updated_at')
    .eq('source', 'airbnb')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastSync = lastAirbnbBlock?.updated_at ?? null

  const minutesAgo = lastSync
    ? Math.round((Date.now() - new Date(lastSync).getTime()) / 60000)
    : null

  const emailFrom = process.env.EMAIL_FROM ?? null
  const emailOwner = process.env.EMAIL_OWNER ?? null

  return (
    <div className="p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-midnight">
          Intégrations
        </h1>
        <p className="mt-1 font-sans text-sm text-midnight-400">
          iCal sync and email configuration
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* iCal Sync */}
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-midnight">
            Synchronisation iCal
          </h2>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Automatically syncs Airbnb blocked dates via iCal feed.
          </p>

          {/* Airbnb iCal URL */}
          <div className="mt-6 rounded-xl border border-sand-300 bg-sand-50 p-5">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0 text-gold"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="font-sans text-sm font-medium text-midnight">
                  Airbnb iCal URL is configured via environment variable
                </p>
                <p className="mt-1 font-sans text-sm text-midnight-400">
                  To update the Airbnb iCal feed URL, set{' '}
                  <code className="rounded bg-pearl-400 px-1.5 py-0.5 font-mono text-xs text-midnight">
                    AIRBNB_ICAL_URL
                  </code>{' '}
                  in your Vercel environment variables. Changes take effect on
                  the next deployment.
                </p>
              </div>
            </div>
          </div>

          {/* Last sync status */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  minutesAgo !== null && minutesAgo < 90
                    ? 'bg-leaf'
                    : minutesAgo !== null
                    ? 'bg-gold'
                    : 'bg-midnight-300'
                }`}
              />
              <p className="font-sans text-sm text-midnight-400">
                {minutesAgo !== null
                  ? `Last sync: ${
                      minutesAgo < 1
                        ? 'just now'
                        : minutesAgo < 60
                        ? `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`
                        : `${Math.round(minutesAgo / 60)} hour${Math.round(minutesAgo / 60) !== 1 ? 's' : ''} ago`
                    } (${new Date(lastSync!).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`
                  : 'No sync data found'}
              </p>
            </div>
            <IcalSyncButton />
          </div>

          {/* Cron info */}
          <p className="mt-4 font-sans text-xs text-midnight-400">
            Automatic sync runs hourly via Vercel Cron. Manual trigger uses the{' '}
            <code className="rounded bg-pearl-400 px-1 py-0.5 font-mono text-[0.7rem] text-midnight">
              CRON_SECRET
            </code>{' '}
            environment variable.
          </p>
        </div>

        {/* Email Config */}
        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-midnight">
            Configuration Email
          </h2>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Transactional email settings via Resend.
          </p>

          <div className="mt-6 space-y-4">
            {/* From address */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                Adresse d'envoi
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-pearl-400 bg-pearl px-4 py-2.5">
                <span className="font-sans text-sm text-midnight">
                  {emailFrom ?? (
                    <span className="italic text-midnight-400">
                      EMAIL_FROM not set
                    </span>
                  )}
                </span>
                <span className="ml-auto rounded-lg border border-pearl-400 bg-pearl-300 px-2 py-0.5 font-sans text-xs text-midnight-400">
                  read-only
                </span>
              </div>
              <p className="font-sans text-xs text-midnight-400">
                To change, update{' '}
                <code className="rounded bg-pearl-400 px-1 py-0.5 font-mono text-[0.7rem] text-midnight">
                  EMAIL_FROM
                </code>{' '}
                in Vercel environment variables.
              </p>
            </div>

            {/* Owner notification email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400">
                Email de notification propriétaire
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-pearl-400 bg-pearl px-4 py-2.5">
                <span className="font-sans text-sm text-midnight">
                  {emailOwner ?? (
                    <span className="italic text-midnight-400">
                      EMAIL_OWNER not set
                    </span>
                  )}
                </span>
                <span className="ml-auto rounded-lg border border-pearl-400 bg-pearl-300 px-2 py-0.5 font-sans text-xs text-midnight-400">
                  read-only
                </span>
              </div>
              <p className="font-sans text-xs text-midnight-400">
                To change, update{' '}
                <code className="rounded bg-pearl-400 px-1 py-0.5 font-mono text-[0.7rem] text-midnight">
                  EMAIL_OWNER
                </code>{' '}
                in Vercel environment variables.
              </p>
            </div>
          </div>

          {/* Test email (TODO) */}
          <div className="mt-6 border-t border-pearl-400 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-sm font-medium text-midnight">
                  Send Test Email
                </p>
                <p className="font-sans text-xs text-midnight-400">
                  Sends a test email to the owner address to verify delivery.
                </p>
              </div>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="cursor-not-allowed rounded-xl border border-pearl-400 bg-pearl px-4 py-2 font-sans text-sm font-medium text-midnight-400 opacity-50"
              >
                Send Test Email (TODO)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
