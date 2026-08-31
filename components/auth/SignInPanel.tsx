'use client'

import { Lock, ShieldCheck } from 'lucide-react'

import { EmailMagicLinkForm } from './EmailMagicLinkForm'
import { GoogleSignInButton } from './GoogleSignInButton'

/**
 * The sign-in card, shared by the checkout gate and the standalone
 * `/signin` page.
 *
 * Extracted rather than copied: the checkout owned the only version of this
 * screen, and a second hand-written copy would have drifted the moment either
 * one changed. Callers supply their own wording because the two contexts read
 * very differently — one interrupts a payment, the other is a deliberate visit.
 *
 * `redirectTo` is a path, never a URL. It reaches `/auth/complete?next=`,
 * which only accepts internal paths.
 */
interface SignInPanelProps {
  title: string
  description: string
  /** Where to land once the session is established. */
  redirectTo: string
  /** Reassurances listed under the form. Omit for a bare panel. */
  benefits?: string[]
  className?: string
}

export function SignInPanel({
  title,
  description,
  redirectTo,
  benefits,
  className,
}: SignInPanelProps) {
  return (
    <div
      className={[
        'flex w-full max-w-md flex-col items-center gap-6 rounded-2xl',
        'border border-pearl-400 bg-pearl p-8 shadow-soft sm:p-10',
        className ?? '',
      ].join(' ')}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
        <ShieldCheck className="h-7 w-7 text-gold" aria-hidden="true" />
      </div>

      <div className="text-center">
        <h2 className="font-heading text-h3-luxe font-medium text-midnight">
          {title}
        </h2>
        <p className="mt-2 font-sans text-body-sm text-midnight-400">
          {description}
        </p>
      </div>

      <GoogleSignInButton redirectTo={redirectTo} className="w-full" />

      <div className="flex w-full items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-pearl-400" />
        <span className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
          or
        </span>
        <span className="h-px flex-1 bg-pearl-400" />
      </div>

      <EmailMagicLinkForm redirectTo={redirectTo} className="w-full" />

      {benefits && benefits.length > 0 ? (
        <ul className="flex flex-col gap-2 self-start text-body-sm text-midnight-400">
          {benefits.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 flex-none text-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
