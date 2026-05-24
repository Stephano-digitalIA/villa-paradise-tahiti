import { Container, Section } from '@/components/ui'

export interface ReviewsStatsProps {
  averageRating: number
  totalReviews: number
  repeatGuestsPercent: number
  responseTime: string
}

const formatNumber = (n: number) => n.toLocaleString('en-US')

/**
 * ReviewsStats — four-pillar trust strip.
 * Quiet hairline-divided figures, anchored above the filter strip.
 */
export function ReviewsStats({
  averageRating,
  totalReviews,
  repeatGuestsPercent,
  responseTime,
}: ReviewsStatsProps) {
  const items = [
    {
      value: averageRating.toFixed(2).replace(/\.?0+$/, ''),
      suffix: '/5',
      label: 'Average rating',
    },
    {
      value: `${formatNumber(totalReviews)}+`,
      label: 'Verified reviews',
    },
    {
      value: `${repeatGuestsPercent}%`,
      label: 'Repeat guests',
    },
    {
      value: responseTime,
      label: 'Avg. response time',
    },
  ]

  return (
    <Section tone="sand" spacing="tight">
      <Container>
        <dl className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center sm:border-r sm:border-pearl-500 sm:last:border-r-0"
            >
              <dd className="font-heading text-h2-luxe font-medium text-midnight">
                {item.value}
                {item.suffix ? (
                  <span className="text-gold">{item.suffix}</span>
                ) : null}
              </dd>
              <dt className="mt-2 text-eyebrow uppercase tracking-widest2 text-midnight-400">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  )
}
