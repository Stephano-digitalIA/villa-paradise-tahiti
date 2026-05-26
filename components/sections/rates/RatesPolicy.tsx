import { Container, Section } from '@/components/ui'
import { PortableTextRenderer } from '@/components/sections/_shared/PortableTextRenderer'
import type { Settings } from '@/lib/sanity'

interface RatesPolicyProps {
  settings: Settings | null
}

/**
 * RatesPolicy — deposit terms + cancellation policy.
 *
 * Sources the cancellation copy from `settings.defaultCancellationPolicy`
 * when available, falls back to a verbose placeholder otherwise. Deposit
 * terms are derived from `defaultDepositPercent`.
 */
export function RatesPolicy({ settings }: RatesPolicyProps) {
  const depositPercent = settings?.defaultDepositPercent ?? 30
  const minNights = settings?.defaultMinNights ?? 5
  const cancellation = settings?.defaultCancellationPolicy

  return (
    <Section tone="pearl" spacing="default">
      <Container className="max-w-5xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Deposit / terms */}
          <article className="flex flex-col rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-soft">
            <p className="eyebrow mb-3">Deposit &amp; terms</p>
            <h3 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              How payment works
            </h3>
            <dl className="mt-8 flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  Deposit at booking
                </dt>
                <dd className="font-heading text-h3-luxe font-medium text-midnight">
                  {depositPercent}%
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  Balance due
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  30 days before arrival
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  Minimum stay
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  {minNights} nights (7 in peak)
                </dd>
              </div>
              <div className="flex items-baseline justify-between pb-1">
                <dt className="font-sans text-body-sm text-midnight-400">
                  Payment methods
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  Stripe · PayPal · Wire
                </dd>
              </div>
            </dl>
          </article>

          {/* Cancellation policy */}
          <article className="flex flex-col rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-soft">
            <p className="eyebrow mb-3">Cancellation</p>
            <h3 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              Flexible, transparent
            </h3>
            <div className="mt-6 flex-1">
              {cancellation && cancellation.length > 0 ? (
                <PortableTextRenderer value={cancellation} prose={false} />
              ) : (
                <div className="flex flex-col gap-4 font-sans text-body-md text-midnight-400">
                  <p>
                    <span className="font-semibold text-midnight">
                      More than 60 days before check-in:
                    </span>{' '}
                    50% refund.
                  </p>
                  <p>
                    <span className="font-semibold text-midnight">
                      30 to 60 days before check-in:
                    </span>{' '}
                    non-refundable.
                  </p>
                  <p>
                    <span className="font-semibold text-midnight">
                      Inside 30 days:
                    </span>{' '}
                    non-refundable. Travel insurance strongly recommended.
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </Container>
    </Section>
  )
}
