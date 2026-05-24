import { Container, Section } from '@/components/ui'
import type { Villa } from '@/lib/sanity'

import { PortableTextRenderer } from '../_shared/PortableTextRenderer'

interface VillaDescriptionProps {
  villa: Villa
}

/**
 * Villa description section — renders the long-form Portable Text body
 * stored in Sanity using the shared `PortableTextRenderer`.
 */
export function VillaDescription({ villa }: VillaDescriptionProps) {
  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              The Story
            </p>
            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
              A villa shaped by the light, the lagoon and the trade winds.
            </h2>
          </div>
          <div>
            <PortableTextRenderer value={villa.description} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
