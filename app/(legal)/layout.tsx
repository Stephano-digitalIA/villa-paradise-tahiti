import type { ReactNode } from 'react'
import { Container, Section } from '@/components/ui'
import { LegalSidebar } from '@/components/sections/legal'

/**
 * Layout shared by every page under `/legal/*`.
 *
 * Renders a two-column grid on `lg:` with a sticky `<LegalSidebar />`
 * on the left and a `prose`-styled article wrapper on the right. Below
 * `lg:` the sidebar is hidden (the legal links live in the footer for
 * mobile users) so the long-form reading flow stays uncluttered.
 *
 * The article wrapper applies Tailwind Typography's `prose prose-lg`
 * variant; each legal page can drop in raw `<h2>`, `<p>`, `<ul>` and
 * inherit the design-system-friendly defaults. Components that need to
 * break out of the prose flow (banners, tier cards) should wrap their
 * outer element with `not-prose`.
 */

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <Section tone="pearl" spacing="compact">
      <Container className="pt-20 sm:pt-24 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
          <LegalSidebar />

          <article
            className="prose prose-lg max-w-3xl
                       prose-headings:font-heading prose-headings:text-midnight
                       prose-h1:font-display prose-h1:italic prose-h1:font-light
                       prose-h2:font-medium prose-h2:text-h2-luxe prose-h2:mt-12 prose-h2:mb-4
                       prose-h3:font-semibold prose-h3:text-h3-luxe prose-h3:mt-8 prose-h3:mb-3
                       prose-p:font-sans prose-p:text-body-md prose-p:text-midnight
                       prose-li:font-sans prose-li:text-body-md prose-li:text-midnight
                       prose-strong:text-midnight
                       prose-a:text-lagoon prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4"
          >
            {children}
          </article>
        </div>
      </Container>
    </Section>
  )
}
