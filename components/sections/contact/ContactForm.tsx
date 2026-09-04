'use client'

import { useState } from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { Button, DateField, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { todayISO, addDaysISO } from '@/lib/booking'
import {
  contactFormSchema,
  type ContactFormInput,
  type ContactFormValues,
} from './contact-schema'
import {
  CONTACT_FORM_LABEL_DEFAULTS,
  type ContactFormLabels,
} from '@/lib/content/contact'

/**
 * ContactForm — client-side inquiry form.
 *
 * Validation: zod (single source of truth, see `contact-schema.ts`) wired
 * through `@hookform/resolvers/zod`. The schema is also intended to be
 * imported by the Phase E `/api/contact` route handler so client and
 * server share the exact same contract.
 *
 * Copy: every visible string arrives via the `labels` prop, resolved
 * server-side from the content registry, because this is a client component
 * and `getSiteContent()` is server-only. Falls back to the published English
 * when the prop is omitted.
 *
 * Submission: in this phase we only `console.log` the payload and switch
 * to a "thank you" success state. Phase E will replace the handler body
 * with a `fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })`
 * call (Resend transactional email + inquiry record).
 *
 * Accessibility:
 *  - Each field has a real `<label htmlFor>` (no placeholders-as-labels).
 *  - Errors are wired with `aria-invalid` + `aria-describedby` pointing to
 *    the message element; the message receives `role="alert"` so AT users
 *    are notified when validation fails.
 *  - The submit button announces busy state via `aria-busy`.
 *  - On success we render a status region with `role="status"` for SR
 *    feedback without stealing focus from later sections.
 */
export function ContactForm({
  labels = CONTACT_FORM_LABEL_DEFAULTS,
}: {
  /** Resolved server-side from the content registry; see lib/content/contact.ts. */
  labels?: ContactFormLabels
} = {}) {
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      message: '',
    },
    mode: 'onBlur',
  })

  // Check-out can't precede check-in; when a check-in is picked, bound the
  // check-out calendar to the day after. Both fields stay optional.
  const checkInValue = watch('checkIn')

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    try {
      // Phase E1: real submission. `/api/contact` re-validates with the
      // same Zod schema and dispatches the Resend emails (owner + auto-reply).
      // Visitor inputs are intentionally preserved on failure so they can
      // retry without re-typing.
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // 4xx (validation) or 5xx (server) — surface a recoverable error
        // without clearing the inputs.
        // eslint-disable-next-line no-console
        console.error('[contact] HTTP', response.status, response.statusText)
        setSubmitState('error')
        return
      }

      setSubmitState('success')
      reset()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[contact] submission error', err)
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'rounded-2xl border border-leaf/30 bg-leaf/5 p-8 sm:p-10',
          'flex flex-col items-start gap-4'
        )}
      >
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-leaf/15 text-leaf"
          aria-hidden="true"
        >
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-heading text-h3-luxe text-midnight">{labels.successTitle}</h3>
          <p className="mt-2 font-sans text-body-md text-midnight-400">
            {labels.successBody}{' '}
            <a href="/experiences" className="text-lagoon underline-offset-4 hover:underline">
              {labels.successLink}
            </a>
            .
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setSubmitState('idle')}
        >
          {labels.successAgain}
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-describedby={submitState === 'error' ? 'contact-form-error' : undefined}
    >
      {/* Full name */}
      <Field
        id="contact-fullName"
        label={labels.name}
        required
        error={errors.fullName?.message}
      >
        <Input
          id="contact-fullName"
          type="text"
          autoComplete="name"
          {...register('fullName')}
          error={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'contact-fullName-error' : undefined}
        />
      </Field>

      {/* Email */}
      <Field id="contact-email" label={labels.email} required error={errors.email?.message}>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          {...register('email')}
          error={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
      </Field>

      {/* Phone (optional) */}
      <Field
        id="contact-phone"
        label={labels.phone}
        optional
        optionalLabel={labels.optional}
        helperText={labels.phoneHelper}
        error={errors.phone?.message}
      >
        <Input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          {...register('phone')}
          error={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? 'contact-phone-error' : 'contact-phone-helper'
          }
        />
      </Field>

      {/* Travel dates */}
      <fieldset className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <legend className="sr-only">{labels.datesLegend}</legend>

        <Field
          id="contact-checkIn"
          label={labels.arrival}
          optional
          optionalLabel={labels.optional}
          error={errors.checkIn?.message}
        >
          <Controller
            control={control}
            name="checkIn"
            render={({ field }) => (
              <DateField
                id="contact-checkIn"
                value={field.value ?? ''}
                onChange={field.onChange}
                min={todayISO()}
                error={Boolean(errors.checkIn)}
                aria-describedby={errors.checkIn ? 'contact-checkIn-error' : undefined}
                aria-label={labels.arrivalAria}
              />
            )}
          />
        </Field>

        <Field
          id="contact-checkOut"
          label={labels.departure}
          optional
          optionalLabel={labels.optional}
          error={errors.checkOut?.message}
        >
          <Controller
            control={control}
            name="checkOut"
            render={({ field }) => (
              <DateField
                id="contact-checkOut"
                value={field.value ?? ''}
                onChange={field.onChange}
                min={checkInValue ? addDaysISO(checkInValue, 1) : addDaysISO(todayISO(), 1)}
                error={Boolean(errors.checkOut)}
                aria-describedby={errors.checkOut ? 'contact-checkOut-error' : undefined}
                aria-label={labels.departureAria}
              />
            )}
          />
        </Field>
      </fieldset>

      {/* Guests */}
      <Field
        id="contact-guests"
        label={labels.guests}
        optional
        optionalLabel={labels.optional}
        error={errors.guests?.message}
      >
        <Input
          id="contact-guests"
          type="number"
          min={1}
          max={24}
          step={1}
          inputMode="numeric"
          {...register('guests')}
          error={Boolean(errors.guests)}
          aria-describedby={errors.guests ? 'contact-guests-error' : undefined}
        />
      </Field>

      {/* Message */}
      <Field
        id="contact-message"
        label={labels.message}
        required
        helperText={labels.messageHelper}
        error={errors.message?.message}
      >
        <textarea
          id="contact-message"
          rows={6}
          {...register('message')}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? 'contact-message-error' : 'contact-message-helper'
          }
          className={cn(
            'flex w-full rounded-lg bg-pearl px-4 py-3 font-sans text-body-md text-midnight',
            'border border-lagoon/20',
            'placeholder:text-midnight-300',
            'transition-colors duration-200',
            'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:bg-pearl-300 disabled:opacity-60',
            'resize-y min-h-[8rem]',
            errors.message && 'border-coral focus:border-coral focus:ring-coral/30'
          )}
        />
      </Field>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting || undefined}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </Button>

        {submitState === 'error' ? (
          <p
            id="contact-form-error"
            role="alert"
            className="mt-4 font-sans text-body-sm text-coral"
          >
            {labels.error}
          </p>
        ) : null}

        <p className="mt-4 font-sans text-body-sm text-midnight-400">
          {labels.privacyText}{' '}
          <a
            href="/legal/privacy-policy"
            className="text-lagoon underline-offset-4 hover:underline"
          >
            {labels.privacyLink}
          </a>
          .
        </p>
      </div>
    </form>
  )
}

/* ---------- Field — internal helper for consistent label + error markup ------ */

interface FieldProps {
  id: string
  label: string
  required?: boolean
  optional?: boolean
  /** Wording of the "optional" marker, so it travels with the rest of the copy. */
  optionalLabel?: string
  helperText?: string
  error?: string
  children: React.ReactNode
}

function Field({
  id,
  label,
  required,
  optional,
  optionalLabel = CONTACT_FORM_LABEL_DEFAULTS.optional,
  helperText,
  error,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-sans text-body-sm font-medium text-midnight"
      >
        {label}
        {required ? (
          <span className="ml-1 text-coral" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? (
          <span className="ml-2 text-eyebrow font-normal uppercase text-midnight-400">
            {optionalLabel}
          </span>
        ) : null}
      </label>
      {children}
      {helperText && !error ? (
        <p
          id={`${id}-helper`}
          className="font-sans text-body-sm text-midnight-400"
        >
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-sans text-body-sm text-coral"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
