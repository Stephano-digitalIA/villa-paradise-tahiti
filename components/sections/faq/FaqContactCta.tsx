import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'

/**
 * FaqContactCta — soft fallback at the bottom of /faq for any question
 * not covered above. Sand tone keeps continuity with other "warm" CTAs.
 */
export function FaqContactCta() {
  return (
    <Section tone="sand" spacing="compact">
      <Container className="max-w-3xl text-center">
        <span className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-pearl text-gold">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>

        <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
          Still have a question?
        </h2>
        <p className="mx-auto mt-4 max-w-prose font-sans text-body-md text-midnight-400">
          We answer within the hour during Tahiti daylight (UTC−10). No
          booking bots, no canned replies — just a direct conversation
          with the owners.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href="/contact">Contact us</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/rates">See rates &amp; availability</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
