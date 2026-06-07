/**
 * CancellationTiers — visual summary of refund tiers.
 *
 * Rendered inside the /legal/cancellation page. Lives in `not-prose`
 * so the `@tailwindcss/typography` styles don't override the custom
 * layout.
 */

interface Tier {
  window: string
  refund: string
  description: string
  tone: 'leaf' | 'gold' | 'coral' | 'midnight'
}

const TIERS: readonly Tier[] = [
  {
    window: 'More than 60 days before arrival',
    refund: '100% refund',
    description: 'Full refund of the total amount paid to the original method.',
    tone: 'leaf',
  },
  {
    window: '30 – 60 days before arrival',
    refund: '50% refund',
    description: 'Half of the total amount paid is refunded to the original method.',
    tone: 'gold',
  },
  {
    window: 'Within 30 days of arrival',
    refund: 'Non-refundable',
    description:
      'No refund is available — travel insurance is strongly recommended.',
    tone: 'midnight',
  },
] as const

const toneStyles: Record<Tier['tone'], { ring: string; badge: string }> = {
  leaf: {
    ring: 'border-leaf/30 bg-leaf/5',
    badge: 'bg-leaf/15 text-leaf',
  },
  gold: {
    ring: 'border-gold/30 bg-gold/5',
    badge: 'bg-gold/20 text-gold-700',
  },
  coral: {
    ring: 'border-coral/30 bg-coral/5',
    badge: 'bg-coral/15 text-coral',
  },
  midnight: {
    ring: 'border-midnight/20 bg-midnight/[0.03]',
    badge: 'bg-midnight/10 text-midnight',
  },
}

export function CancellationTiers() {
  return (
    <div className="not-prose my-10">
      <h2 className="font-heading text-h3-luxe text-midnight">Flexible &amp; transparent</h2>
      <p className="mt-2 font-sans text-body-md text-midnight-400">
        Refund amounts are calculated against the total booking value (deposit
        plus balance) and exclude third-party fees (payment processor,
        non-refundable add-ons such as activity deposits).
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <li
            key={tier.window}
            className={`rounded-2xl border p-5 ${toneStyles[tier.tone].ring}`}
          >
            <p className="text-eyebrow font-semibold uppercase text-midnight-400">
              {tier.window}
            </p>
            <p
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 font-sans text-body-sm font-semibold ${toneStyles[tier.tone].badge}`}
            >
              {tier.refund}
            </p>
            <p className="mt-3 font-sans text-body-sm text-midnight">
              {tier.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
