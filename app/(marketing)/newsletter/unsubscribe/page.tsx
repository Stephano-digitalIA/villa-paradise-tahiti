import type { Metadata } from 'next'
import Link from 'next/link'

import { Button, Container, Section } from '@/components/ui'
import { liveAdminClient } from '@/lib/supabase/admin'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Unsubscribe — Villa Paradise Tahiti',
  description: 'Leave The Slow Letter in one click.',
  path: '/newsletter/unsubscribe',
})

// The token is unique per visitor and the row changes here, so nothing about
// this page can be prerendered or cached.
export const dynamic = 'force-dynamic'

/**
 * One-click unsubscribe.
 *
 * Acting on GET is deliberate. The alternative, a page with a confirm button,
 * reads as a dark pattern and several mail clients prefetch links anyway, so
 * the button would fire without being pressed. Leaving has to be at least as
 * easy as joining, which was a single click.
 *
 * The token is the only credential: unguessable, unique, and it identifies the
 * row without asking anyone to log in.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = (searchParams.token ?? '').trim()
  let outcome: 'done' | 'unknown' = 'unknown'

  if (token !== '') {
    const { data, error } = await liveAdminClient
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .select('id')
      .maybeSingle()

    // An already-unsubscribed address still matches its token, so a second
    // click lands on the same confirmation rather than an error.
    if (!error && data) outcome = 'done'
  }

  return (
    <Section tone="pearl" spacing="default">
      <Container className="max-w-2xl pt-24 text-center">
        {outcome === 'done' ? (
          <>
            <h1 className="font-display text-hero-sm font-light italic text-midnight">
              You are unsubscribed.
            </h1>
            <p className="mx-auto mt-6 max-w-prose font-sans text-body-md text-midnight-400">
              We will not send you The Slow Letter again. Your address stays on file
              only to honour that choice. Booking emails, if you have a stay with us,
              are separate and unaffected.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-hero-sm font-light italic text-midnight">
              This link is no longer valid.
            </h1>
            <p className="mx-auto mt-6 max-w-prose font-sans text-body-md text-midnight-400">
              It may have been mistyped or truncated by your mail client. Write to us
              and we will remove your address by hand, straight away.
            </p>
          </>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/">Back to the villa</Link>
          </Button>
          {outcome === 'unknown' ? (
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact us</Link>
            </Button>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}
