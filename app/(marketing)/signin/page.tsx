import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { SignInPanel } from '@/components/auth'
import { Container, Section } from '@/components/ui'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sign in — Villa Paradise Tahiti',
  description:
    'Sign in to view your Villa Paradise Tahiti reservations, arrival details and profile.',
  path: '/signin',
  // Nothing here belongs in search results, and an indexed sign-in page only
  // ever competes with the pages that should rank.
  noIndex: true,
})

interface SignInPageProps {
  searchParams: { next?: string }
}

/**
 * /signin — the way in for guests who are not booking right now.
 *
 * Until this page existed the only sign-in screen sat inside the checkout, so
 * a returning guest could not reach their reservations without starting a
 * booking. `/account` sends signed-out visitors back to the home page, which
 * left them nowhere to go.
 *
 * `next` carries the page the guest came from so signing in does not cost
 * them their place. It is validated here and again in `/auth/complete`, which
 * only accepts internal paths.
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const raw = searchParams.next
  const next =
    raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account'

  // Already signed in: honour the destination instead of showing a sign-in
  // form to someone who has a session.
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect(next)

  return (
    <Section tone="pearl" spacing="compact">
      <Container className="flex justify-center">
        <SignInPanel
          title="Sign in"
          description="Access your reservations, arrival details and profile. No password needed, we send you a secure link."
          redirectTo={next}
          benefits={[
            'See your stays and their current status',
            'No password to remember',
            'Your details are pre-filled when you book',
          ]}
        />
      </Container>
    </Section>
  )
}
