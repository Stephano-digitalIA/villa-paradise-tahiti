import type { Metadata } from 'next'
import Link from 'next/link'

import { getAnalyticsSummary, type Bar } from '@/lib/analytics/summary'
import { formatUSD } from '@/lib/booking/pricing'

export const metadata: Metadata = { title: 'Audience — Admin' }

// Counts change constantly; a snapshot would be misleading.
export const dynamic = 'force-dynamic'

const PERIODS = [7, 30, 90] as const

/**
 * One data hue throughout, with identity carried by the text label rather than
 * by colour. Every chart here is a single series, so a categorical palette
 * would add nothing and would have to be proven colourblind-safe; a bar list
 * whose rows are named reads correctly for everyone, including in print.
 */
const HUE = '#006994'

function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-5 shadow-sm">
      <p className="font-sans text-xs font-semibold uppercase tracking-widest text-midnight-400">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-midnight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 font-sans text-xs text-midnight-400">{hint}</p>
      ) : null}
    </div>
  )
}

/** Horizontal bars. Width encodes magnitude, the row label carries identity. */
function BarList({
  title, subtitle, bars, empty, unit,
}: {
  title: string
  subtitle?: string
  bars: Bar[]
  empty: string
  unit: string
}) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-base font-semibold text-midnight">{title}</h2>
      {subtitle ? (
        <p className="mt-1 font-sans text-xs text-midnight-400">{subtitle}</p>
      ) : null}
      {bars.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-midnight-400">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bars.map((b) => (
            <li key={b.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 truncate font-sans text-sm text-midnight" title={b.label}>
                  {b.label}
                </span>
                <span className="shrink-0 font-sans text-sm tabular-nums text-midnight-400">
                  {b.value.toLocaleString('fr-FR')} {unit}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-pearl-300">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(b.value / max) * 100}%`, background: HUE }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Visits per day as a filled area.
 *
 * Drawn as plain SVG rather than with a charting library: one series, no axes
 * to speak of, and the shape is the whole message. Each point carries a
 * `<title>` so hovering names the day and the count.
 */
function Trend({ points }: { points: Array<{ day: string; visitors: number }> }) {
  const width = 720
  const height = 140
  const max = Math.max(1, ...points.map((p) => p.visitors))
  const step = points.length > 1 ? width / (points.length - 1) : width

  const coords = points.map((p, i) => ({
    x: i * step,
    y: height - (p.visitors / max) * (height - 12) - 6,
    ...p,
  }))
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const peak = coords.reduce((a, b) => (b.visitors > a.visitors ? b : a), coords[0])

  return (
    <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Visiteurs par jour
        </h2>
        <span className="font-sans text-xs text-midnight-400">
          maximum {max.toLocaleString('fr-FR')}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Visiteurs par jour sur ${points.length} jours, maximum ${max}`}
        className="mt-4 h-36 w-full"
      >
        <path d={area} fill={HUE} opacity="0.12" />
        <path d={line} fill="none" stroke={HUE} strokeWidth="2" strokeLinejoin="round" />
        {coords.map((c) => (
          <circle key={c.day} cx={c.x} cy={c.y} r="6" fill="transparent">
            <title>
              {new Date(c.day).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
              {' : '}
              {c.visitors} visiteur{c.visitors > 1 ? 's' : ''}
            </title>
          </circle>
        ))}
        {peak && peak.visitors > 0 ? (
          <circle cx={peak.x} cy={peak.y} r="3.5" fill={HUE} stroke="#fff" strokeWidth="2" />
        ) : null}
      </svg>
      <div className="mt-1 flex justify-between font-sans text-xs text-midnight-400">
        <span>
          {points[0]
            ? new Date(points[0].day).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })
            : ''}
        </span>
        <span>Aujourd’hui</span>
      </div>
    </div>
  )
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string }
}) {
  const requested = Number(searchParams.days)
  const days = PERIODS.includes(requested as (typeof PERIODS)[number]) ? requested : 30
  const s = await getAnalyticsSummary(days)

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Audience</h1>
          <p className="mt-1 max-w-2xl font-sans text-sm text-midnight-400">
            Mesure interne, sans cookie et sans donnée personnelle. Aucun visiteur
            n’est identifié ni suivi d’un jour à l’autre, donc aucune bannière de
            consentement n’est nécessaire et tout le monde est compté.
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?days=${p}`}
              className={
                'rounded-lg border px-3 py-1.5 font-sans text-sm transition-colors ' +
                (p === days
                  ? 'border-midnight bg-midnight text-pearl'
                  : 'border-pearl-400 bg-white text-midnight-400 hover:border-midnight hover:text-midnight')
              }
            >
              {p} jours
            </Link>
          ))}
        </div>
      </div>

      {s.tableMissing ? (
        <div className="mt-6 rounded-2xl border border-coral/30 bg-coral/5 p-6">
          <h2 className="font-heading text-base font-semibold text-coral">
            Migration à appliquer
          </h2>
          <p className="mt-2 max-w-2xl font-sans text-sm text-midnight-400">
            La table de mesure n’existe pas encore. Ouvre l’éditeur SQL de Supabase et
            exécute
            <code className="mx-1 rounded bg-pearl px-1.5 py-0.5 text-xs">
              supabase/migrations/019_analytics.sql
            </code>
            puis recharge cette page. Les chiffres commenceront à se remplir à partir
            de ce moment : il n’y a pas d’historique à rattraper.
          </p>
        </div>
      ) : null}

      {s.truncated ? (
        <p className="mt-6 rounded-xl border border-gold/40 bg-gold/5 px-4 py-2.5 font-sans text-sm text-gold-700">
          Beaucoup d’événements sur cette période : les chiffres portent sur les
          premiers enregistrés et sous-estiment donc la réalité. Choisis une période
          plus courte.
        </p>
      ) : null}

      {/* Headline figures */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Visiteurs"
          value={s.visitors.toLocaleString('fr-FR')}
          hint={`sur ${days} jours`}
        />
        <StatTile
          label="Pages vues"
          value={s.pageViews.toLocaleString('fr-FR')}
          hint={
            s.visitors > 0
              ? `${(s.pageViews / s.visitors).toFixed(1)} par visiteur`
              : undefined
          }
        />
        <StatTile
          label="Réservations payées"
          value={s.business.paid.toLocaleString('fr-FR')}
          hint={`${s.business.reservations} entamée(s)`}
        />
        <StatTile
          label="Encaissé"
          value={formatUSD(s.business.revenueUSD)}
          hint="acomptes reçus"
        />
      </div>

      {s.perDay.length > 0 ? (
        <div className="mt-6">
          <Trend points={s.perDay} />
        </div>
      ) : null}

      {/* Funnel */}
      <div className="mt-6 rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-midnight">
          Entonnoir de réservation
        </h2>
        <p className="mt-1 font-sans text-xs text-midnight-400">
          Visiteurs distincts atteignant chaque étape. Le pourcentage compare à
          l’étape précédente : c’est là que se lisent les abandons.
        </p>
        {s.funnel.length === 0 || s.funnel[0].visitors === 0 ? (
          <p className="mt-4 font-sans text-sm text-midnight-400">
            Aucune visite mesurée sur la période.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {s.funnel.map((step) => {
              const share = s.funnel[0].visitors
                ? (step.visitors / s.funnel[0].visitors) * 100
                : 0
              return (
                <li key={step.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-sans text-sm text-midnight">{step.label}</span>
                    <span className="shrink-0 font-sans text-sm tabular-nums text-midnight-400">
                      {step.visitors.toLocaleString('fr-FR')}
                      {step.ofPrevious !== null ? (
                        <span
                          className={
                            step.ofPrevious < 40 ? 'ml-2 text-coral' : 'ml-2 text-leaf'
                          }
                        >
                          {step.ofPrevious}% de l’étape précédente
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-pearl-300">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(share, 0.5)}%`, background: HUE }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarList
          title="Pages les plus vues"
          bars={s.topPages}
          unit="vues"
          empty="Rien de mesuré pour l’instant."
        />
        <BarList
          title="Photos les plus ouvertes"
          subtitle="Photos agrandies depuis la galerie."
          bars={s.topPhotos}
          unit="ouvertures"
          empty="Aucune photo agrandie sur la période."
        />
        <BarList
          title="Origine des visiteurs"
          bars={s.sources}
          unit="vues"
          empty="Rien de mesuré pour l’instant."
        />
        <BarList
          title="Pays"
          subtitle="Fourni par le réseau de diffusion, absent en développement local."
          bars={s.countries}
          unit="vues"
          empty="Aucun pays remonté."
        />
        <BarList
          title="Appareils"
          bars={s.devices}
          unit="vues"
          empty="Rien de mesuré pour l’instant."
        />

        <div className="rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-semibold text-midnight">
            Activité commerciale
          </h2>
          <p className="mt-1 font-sans text-xs text-midnight-400">
            Ces chiffres viennent de la base, pas de la mesure d’audience : ils sont
            exacts même sans visite enregistrée.
          </p>
          <dl className="mt-4 flex flex-col gap-3">
            {[
              ['Réservations entamées', s.business.reservations],
              ['Réservations payées', s.business.paid],
              ['Demandes de contact', s.business.inquiries],
              ['Inscriptions newsletter', s.business.subscribers],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-baseline justify-between border-b border-pearl-400 pb-2 last:border-0 last:pb-0"
              >
                <dt className="font-sans text-sm text-midnight-400">{label}</dt>
                <dd className="font-heading text-lg font-semibold tabular-nums text-midnight">
                  {Number(value).toLocaleString('fr-FR')}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
