import { Container, Section } from '@/components/ui'
import { FaqAccordion } from './FaqAccordion'
import type { FAQ, FaqCategory } from '@/lib/sanity'

interface FaqGroupsProps {
  faqs: FAQ[]
}

/**
 * Display labels for each FAQ category, in the order we want to surface
 * them on the page (booking-related questions first, then villa-specific,
 * then everything else).
 */
const CATEGORY_ORDER: ReadonlyArray<{ key: FaqCategory; label: string; description: string }> = [
  {
    key: 'booking',
    label: 'Booking & reservations',
    description: 'How to book, minimum stays, lead time, peak season.',
  },
  {
    key: 'payment',
    label: 'Payment & cancellation',
    description: 'Payment methods, deposit terms, refunds.',
  },
  {
    key: 'villa',
    label: 'The villa',
    description: 'Layout, capacity, amenities, accessibility.',
  },
  {
    key: 'experiences',
    label: 'Experiences & add-ons',
    description: 'How concierge bookings work, weather contingencies.',
  },
  {
    key: 'tahiti',
    label: 'Tahiti & travel',
    description: 'Visas, weather, transfers, currency.',
  },
]

/**
 * FaqGroups — renders the FAQ list grouped by category.
 *
 * Each category becomes its own block with a heading + description +
 * accordion. Empty categories are omitted entirely so the page never
 * shows hollow headings.
 */
export function FaqGroups({ faqs }: FaqGroupsProps) {
  const byCategory = new Map<FaqCategory, FAQ[]>()
  for (const faq of faqs) {
    const bucket = byCategory.get(faq.category) ?? []
    bucket.push(faq)
    byCategory.set(faq.category, bucket)
  }

  // Sort within each category by `order` to match the schema convention.
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.order - b.order)
  }

  return (
    <Section tone="pearl" spacing="default">
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-16">
          {CATEGORY_ORDER.map(({ key, label, description }) => {
            const items = byCategory.get(key)
            if (!items || items.length === 0) return null

            return (
              <section key={key} id={`faq-${key}`} aria-labelledby={`faq-${key}-heading`}>
                <header className="mb-6 flex flex-col gap-2">
                  <p className="eyebrow">{label}</p>
                  <h2
                    id={`faq-${key}-heading`}
                    className="font-heading text-h2-luxe font-medium text-midnight"
                  >
                    {label}
                  </h2>
                  <p className="font-sans text-body-sm text-midnight-400">
                    {description}
                  </p>
                </header>
                <FaqAccordion faqs={items} />
              </section>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
