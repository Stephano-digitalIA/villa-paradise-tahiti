import { CalendarClock, TrendingUp, UserPlus, Users } from 'lucide-react'

export interface KpiData {
  totalClients: number
  newThisMonth: number
  newThisMonthDelta: number
  nextArrival: { name: string; date: string } | null
  topRevenue12m: number
}

interface KpiCardsProps {
  data: KpiData
}

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        label="Total clients"
        value={data.totalClients.toLocaleString('fr-FR')}
        icon={<Users className="h-4 w-4" />}
      />
      <Card
        label="New this month"
        value={data.newThisMonth.toLocaleString('fr-FR')}
        delta={data.newThisMonthDelta}
        icon={<UserPlus className="h-4 w-4" />}
      />
      <Card
        label="Next arrival"
        value={data.nextArrival ? data.nextArrival.name : '—'}
        subtitle={data.nextArrival ? formatDate(data.nextArrival.date) : 'No upcoming stay'}
        icon={<CalendarClock className="h-4 w-4" />}
      />
      <Card
        label="Top 10 revenue · 12 m"
        value={formatUSD(data.topRevenue12m)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  )
}

interface CardProps {
  label: string
  value: string
  subtitle?: string
  delta?: number
  icon: React.ReactNode
}

function Card({ label, value, subtitle, delta, icon }: CardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-pearl-400 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-midnight-400">
        <span>{label}</span>
        <span className="text-gold">{icon}</span>
      </div>
      <p className="font-heading text-2xl font-medium text-midnight truncate">{value}</p>
      {subtitle ? (
        <p className="font-sans text-xs text-midnight-400">{subtitle}</p>
      ) : null}
      {typeof delta === 'number' && delta !== 0 ? (
        <p
          className={
            'font-sans text-xs font-medium ' +
            (delta > 0 ? 'text-leaf' : 'text-coral')
          }
        >
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} vs last month
        </p>
      ) : null}
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
