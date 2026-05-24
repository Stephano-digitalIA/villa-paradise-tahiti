import type { Metadata } from 'next'

import { JsonLd, breadcrumbSchema, faqPageSchema } from '@/components/seo'
import { FaqContactCta } from '@/components/sections/faq/FaqContactCta'
import { FaqGroups } from '@/components/sections/faq/FaqGroups'
import { FaqHero } from '@/components/sections/faq/FaqHero'
import { sanityFetch } from '@/lib/sanity/fetcher'
import { faqsQuery, type FAQ } from '@/lib/sanity'
import { SITE_URL, absoluteUrl, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'FAQ — Villa Paradise Tahiti',
  description:
    'Everything you need to know before booking Villa Paradise: visas, payment, cancellation, villa amenities, concierge experiences and more.',
  path: '/faq',
})

/**
 * Extract plain text from a Markdown answer string for structured data.
 * Strips Markdown syntax characters so the FAQ schema JSON-LD stays clean.
 */
function answerToPlain(answer: string | undefined): string {
  if (!answer) return ''
  // Strip common Markdown: headings, bold/italic, links, blockquotes, list markers
  return answer
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[>*+-]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}

/**
 * /faq — Topical disclosure list.
 *
 * Data flow:
 *  1. `sanityFetch(faqsQuery)` returns all entries pre-sorted by category
 *     and `order` (handled in the mock fallback too).
 *  2. `FaqGroups` re-buckets and re-orders by display priority.
 *  3. Each category gets its own accordion (`FaqAccordion`).
 *
 * Structured data: schema.org `FAQPage` with every question/answer pair
 * flattened to plain text — eligible for Google's FAQ rich result.
 */
export default async function FaqPage() {
  const faqs = await sanityFetch<FAQ[]>(faqsQuery)

  const faqEntries = (faqs ?? [])
    .map((faq) => ({
      question: faq.question,
      answer: answerToPlain(faq.answer),
    }))
    .filter((entry) => entry.answer.length > 0)

  return (
    <>
      {faqEntries.length > 0 ? (
        <JsonLd data={faqPageSchema(faqEntries)} />
      ) : null}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'FAQ', url: absoluteUrl('/faq') },
        ])}
      />
      <FaqHero />
      <FaqGroups faqs={faqs} />
      <FaqContactCta />
    </>
  )
}
