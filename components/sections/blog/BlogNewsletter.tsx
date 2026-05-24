import { Mail } from 'lucide-react'
import { Button, Container, Input, Section } from '@/components/ui'

/**
 * BlogNewsletter — soft email capture for the journal index.
 *
 * Currently non-functional — the form has no action. Phase E will wire
 * it up to Resend / a Supabase function. We keep the UI here so layout
 * decisions stay stable.
 */
export function BlogNewsletter() {
  return (
    <Section tone="sand" spacing="compact">
      <Container className="max-w-3xl text-center">
        <span className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-pearl text-gold">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>

        <p className="eyebrow mb-3">The Slow Letter</p>
        <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight">
          Tahiti tips, once a month
        </h2>
        <p className="mx-auto mt-4 max-w-prose font-sans text-body-md text-midnight-400">
          Honest island recommendations, new journal entries and the
          occasional last-minute date for Villa Paradise. No spam, no
          marketing fluff — unsubscribe in one click.
        </p>

        <form
          className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          // TODO Phase E — wire to Resend audience API.
          action="#"
          method="post"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>

        <p className="mt-4 font-sans text-caption text-midnight-400">
          By subscribing, you agree to our{' '}
          <a
            href="/legal/privacy-policy"
            className="underline underline-offset-2 hover:text-gold"
          >
            privacy policy
          </a>
          .
        </p>
      </Container>
    </Section>
  )
}
