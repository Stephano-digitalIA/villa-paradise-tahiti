'use client'

/**
 * CheckoutPageClient — orchestrates the /booking/checkout layout.
 *
 * Render states (in order):
 *  1. Skeleton — BookingProvider rehydrating from localStorage / auth loading.
 *  2. Auth gate — visitor not signed in. Two options: Google, email magic link.
 *  3. Incomplete booking — missing dates/guests, send back to /booking.
 *  4. Full 2-column checkout.
 */

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react'

import { Button, Container, Section } from '@/components/ui'
import {
  EmailMagicLinkForm,
  GoogleSignInButton,
  useAuth,
} from '@/components/auth'

import { useBooking } from '../BookingProvider'
import { CheckoutBreadcrumb } from './CheckoutBreadcrumb'
import { CheckoutForm, type CheckoutInitialProfile } from './CheckoutForm'
import { CheckoutFormSkeleton } from './CheckoutFormSkeleton'
import { CheckoutSummary } from './CheckoutSummary'
import { CheckoutTrustBadges } from './CheckoutTrustBadges'

export function CheckoutPageClient() {
  const { hydrated, validation } = useBooking()
  const { user, loading: authLoading } = useAuth()

  const profile = useMemo<CheckoutInitialProfile | null>(() => {
    if (!user) return null
    const meta = user.user_metadata ?? {}
    const fullName: string = meta.full_name ?? meta.name ?? ''
    const spaceIdx = fullName.indexOf(' ')
    return {
      firstName: spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName,
      lastName: spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : '',
      email: user.email ?? '',
    }
  }, [user])

  return (
    <>
      {/* ─── Page header (always visible) ────────────────────────── */}
      <Section tone="pearl" spacing="tight">
        <Container className="flex flex-col items-center gap-5 pt-16 text-center sm:pt-20">
          <p className="eyebrow flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Checkout
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <h1 className="font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-hero-md">
            Review Your <span className="not-italic font-heading text-gold">Stay</span>
          </h1>
          <p className="max-w-2xl font-sans text-body-md text-midnight-400 sm:text-body-lg">
            One more step. Confirm your details, choose how to pay, and our concierge will get to
            work on your arrival.
          </p>
          <CheckoutBreadcrumb current="checkout" />
        </Container>
      </Section>

      {/* ─── Body ──────────────────────────────────────────────────── */}
      {authLoading || !hydrated ? (
        <CheckoutFormSkeleton />
      ) : !user ? (
        <AuthGate />
      ) : !validation.isValid ? (
        <IncompleteBookingNotice issues={validation.issues} />
      ) : (
        <CheckoutBody profile={profile} />
      )}
    </>
  )
}

/* ---------------------------------------------------------------------------
 * Main layout — 2 columns on desktop, stacked on mobile.
 * ------------------------------------------------------------------------- */

function CheckoutBody({ profile }: { profile: CheckoutInitialProfile | null }) {
  return (
    <>
      <Section tone="pearl" spacing="compact">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <CheckoutForm initialProfile={profile ?? undefined} />
            </div>
            <div className="lg:col-span-5">
              <CheckoutSummary />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand" spacing="tight">
        <Container>
          <CheckoutTrustBadges />
        </Container>
      </Section>
    </>
  )
}

/* ---------------------------------------------------------------------------
 * Guard — sign-in required before checkout (Google / Apple / email magic link).
 * ------------------------------------------------------------------------- */

function AuthGate() {
  return (
    <Section tone="pearl" spacing="compact">
      <Container className="flex justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-pearl-400 bg-pearl p-8 shadow-soft sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
            <ShieldCheck className="h-7 w-7 text-gold" aria-hidden="true" />
          </div>

          <div className="text-center">
            <h2 className="font-heading text-h3-luxe font-medium text-midnight">
              Sign in to continue
            </h2>
            <p className="mt-2 font-sans text-body-sm text-midnight-400">
              We need to confirm your identity before payment. Choose your preferred method —
              your details are pre-filled and a confirmation is sent to your inbox.
            </p>
          </div>

          <GoogleSignInButton redirectTo="/booking/checkout" className="w-full" />

          <div className="flex w-full items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-pearl-400" />
            <span className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
              or
            </span>
            <span className="h-px flex-1 bg-pearl-400" />
          </div>

          <EmailMagicLinkForm
            redirectTo="/booking/checkout"
            className="w-full"
          />

          <ul className="flex flex-col gap-2 self-start text-body-sm text-midnight-400">
            {[
              'Your name and email are pre-filled automatically',
              'No password to remember',
              'Booking confirmation sent to your inbox',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 flex-none text-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}

/* ---------------------------------------------------------------------------
 * Guard — incomplete booking notice.
 * ------------------------------------------------------------------------- */

interface IncompleteBookingNoticeProps {
  issues: string[]
}

function IncompleteBookingNotice({ issues }: IncompleteBookingNoticeProps) {
  return (
    <Section tone="pearl" spacing="compact">
      <Container className="flex justify-center">
        <div className="flex max-w-xl flex-col gap-5 rounded-2xl border border-coral/30 bg-coral/10 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-coral" aria-hidden="true" />
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-h3-luxe font-medium text-midnight">
                Your booking is incomplete
              </h2>
              <p className="font-sans text-body-sm text-midnight-400">
                Please return to the previous step and complete your selection before continuing
                to checkout.
              </p>
            </div>
          </div>

          {issues.length > 0 ? (
            <ul className="ml-8 flex list-disc flex-col gap-1 text-body-sm text-midnight">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild variant="primary" size="md">
              <Link href="/booking">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to build your stay</span>
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
