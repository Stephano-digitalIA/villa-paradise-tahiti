import { Container, Section } from '@/components/ui'
import { PortableTextRenderer } from '@/components/sections/_shared/PortableTextRenderer'
import type { Settings } from '@/lib/cms'
import { getSiteContent } from '@/lib/content'

interface RatesPolicyProps {
  settings: Settings | null
}

/**
 * RatesPolicy — deposit terms + cancellation policy.
 *
 * Numbers come from settings (/admin/settings): the deposit percentage, the
 * minimum nights, and the cancellation copy when
 * `settings.defaultCancellationPolicy` is filled in. Labels and the fallback
 * cancellation tiers come from /admin/content/rates; the strings below are the
 * published defaults and must mirror `RATES_CONTENT_DEFAULTS`.
 */
export async function RatesPolicy({ settings }: RatesPolicyProps) {
  const t = await getSiteContent()
  const depositPercent = settings?.defaultDepositPercent ?? 30
  const minNights = settings?.defaultMinNights ?? 5
  const cancellation = settings?.defaultCancellationPolicy

  const tiers = [
    {
      label: t('rates.policy.cancel_1_label', 'More than 60 days before arrival:'),
      body: t('rates.policy.cancel_1_body', '100% refund.'),
    },
    {
      label: t('rates.policy.cancel_2_label', '30 to 60 days before arrival:'),
      body: t('rates.policy.cancel_2_body', '50% refund.'),
    },
    {
      label: t('rates.policy.cancel_3_label', 'Within 30 days of arrival:'),
      body: t(
        'rates.policy.cancel_3_body',
        'non-refundable. Travel insurance strongly recommended.',
      ),
    },
  ]

  return (
    <Section tone="pearl" spacing="default">
      <Container className="max-w-5xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Deposit / terms */}
          <article className="flex flex-col rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-soft">
            <p className="eyebrow mb-3">
              {t('rates.policy.deposit_eyebrow', 'Deposit & terms')}
            </p>
            <h3 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              {t('rates.policy.deposit_title', 'How payment works')}
            </h3>
            <dl className="mt-8 flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  {t('rates.policy.label_deposit', 'Deposit at booking')}
                </dt>
                <dd className="font-heading text-h3-luxe font-medium text-midnight">
                  {depositPercent}%
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  {t('rates.policy.label_balance', 'Balance due')}
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  {t('rates.policy.value_balance', '30 days before arrival')}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-pearl-400 pb-4">
                <dt className="font-sans text-body-sm text-midnight-400">
                  {t('rates.policy.label_minstay', 'Minimum stay')}
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  {minNights} {t('rates.policy.value_minstay', 'nights (7 in peak)')}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pb-1">
                <dt className="font-sans text-body-sm text-midnight-400">
                  {t('rates.policy.label_payment', 'Payment methods')}
                </dt>
                <dd className="font-sans text-body-sm font-semibold text-midnight">
                  {t('rates.policy.value_payment', 'PayPal · Credit and debit cards')}
                </dd>
              </div>
            </dl>
          </article>

          {/* Cancellation policy */}
          <article className="flex flex-col rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-soft">
            <p className="eyebrow mb-3">
              {t('rates.policy.cancel_eyebrow', 'Cancellation')}
            </p>
            <h3 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              {t('rates.policy.cancel_title', 'Flexible, transparent')}
            </h3>
            <div className="mt-6 flex-1">
              {cancellation && cancellation.length > 0 ? (
                <PortableTextRenderer value={cancellation} prose={false} />
              ) : (
                <div className="flex flex-col gap-4 font-sans text-body-md text-midnight-400">
                  {tiers.map((tier) => (
                    <p key={tier.label}>
                      <span className="font-semibold text-midnight">{tier.label}</span>{' '}
                      {tier.body}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      </Container>
    </Section>
  )
}
