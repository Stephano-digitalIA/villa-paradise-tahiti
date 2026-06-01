import Link from 'next/link'

export type ClientTab = 'stays' | 'notes' | 'emails' | 'prefs'

const TABS: { id: ClientTab; label: string; badgeKey: 'stays' | 'notes' | 'emails' | null }[] = [
  { id: 'stays',  label: 'Stays',       badgeKey: 'stays' },
  { id: 'notes',  label: 'Notes',       badgeKey: 'notes' },
  { id: 'emails', label: 'Emails',      badgeKey: 'emails' },
  { id: 'prefs',  label: 'Preferences', badgeKey: null },
]

interface ClientTabsProps {
  customerId: string
  active: ClientTab
  counts: {
    stays: number
    notes: number
    emails: number
  }
}

export function ClientTabs({ customerId, active, counts }: ClientTabsProps) {
  return (
    <nav
      aria-label="Client tabs"
      className="flex items-center gap-1 border-b border-pearl-400"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        const href =
          tab.id === 'stays'
            ? `/admin/clients/${customerId}`
            : `/admin/clients/${customerId}?tab=${tab.id}`
        const count = tab.badgeKey ? counts[tab.badgeKey] : null

        return (
          <Link
            key={tab.id}
            href={href}
            scroll={false}
            className={
              'relative inline-flex items-center gap-2 px-4 py-3 font-sans text-sm font-medium transition-colors ' +
              (isActive
                ? 'text-midnight'
                : 'text-midnight-400 hover:text-midnight')
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
            {count !== null ? (
              <span
                className={
                  'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 font-sans text-xs font-semibold ' +
                  (isActive
                    ? 'bg-gold text-midnight'
                    : 'bg-pearl-300 text-midnight-400')
                }
              >
                {count}
              </span>
            ) : null}
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-gold"
              />
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
