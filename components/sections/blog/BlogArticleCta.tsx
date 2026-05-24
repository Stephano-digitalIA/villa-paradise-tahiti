import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import { bookingHref } from '@/lib/navigation'

/**
 * BlogArticleCta — quiet booking nudge at the end of every article.
 * Sand tone keeps it warm without competing with the main /reviews CTA.
 */
export function BlogArticleCta() {
  return (
    <Section tone="sand" spacing="compact">
      <Container className="max-w-3xl text-center">
        <p className="eyebrow mb-3">Inspired?</p>
        <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
          Plan your Tahiti escape
        </h2>
        <p className="mx-auto mt-4 max-w-prose font-sans text-body-md text-midnight-400">
          Villa Paradise sleeps 8 across 4 bedrooms with a private infinity
          pool and lagoon access. Direct booking — the lowest published rate,
          every time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href={bookingHref}>
              Check Availability
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/villa">Explore the Villa</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
