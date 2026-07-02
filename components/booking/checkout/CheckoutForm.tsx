'use client'

/**
 * CheckoutForm — customer information + payment method selector.
 *
 * Architecture:
 *  - `react-hook-form` + `@hookform/resolvers/zod` for validation,
 *    pulling the schema from `lib/booking/checkout-schema.ts`.
 *  - Mode `onBlur` so users get feedback as they tab through fields but
 *    are not yelled at on first keystroke.
 *  - On submit, POSTs `{ booking, customer }` to `/api/checkout`. The
 *    stub returns a `redirectUrl` (Phase D2). Phase E will swap that for
 *    a Stripe Checkout Session URL — the client navigates there exactly
 *    the same way.
 *  - Focus management: on submission error the first invalid field is
 *    focused automatically (`shouldFocusError: true`, RHF default).
 *
 * Field grouping is documented in `docs/04-fonctionnalites.md §2.2`:
 *  1. Contact information
 *  2. Address
 *  3. Travel details (optional)
 *  4. Payment method
 *  5. Acknowledgments
 *
 * Phase E will replace the call site of `fetch('/api/checkout')` to:
 *   const res = await fetch('/api/checkout', { method: 'POST', body })
 *   const { url } = await res.json()
 *   window.location.href = url   // Stripe-hosted page
 */

import { useState, useId } from 'react'

export interface CheckoutInitialProfile {
  firstName: string
  lastName: string
  email: string
}
import { useRouter } from 'next/navigation'
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Lock,
} from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { formatUSD } from '@/lib/booking'
import {
  SUPPORTED_COUNTRIES,
  checkoutFormDefaults,
  checkoutSchema,
  type CheckoutFormData,
} from '@/lib/booking/checkout-schema'

import { useBooking } from '../BookingProvider'

/* ---------------------------------------------------------------------------
 * Section header — visual rhythm between groups of fields.
 * ------------------------------------------------------------------------- */

interface SectionHeaderProps {
  step: number
  title: string
  description?: string
}

function SectionHeader({ step, title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-midnight text-xs font-semibold text-pearl"
        >
          {step}
        </span>
        <h2 className="font-heading text-h3-luxe font-medium leading-tight text-midnight">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="ml-10 font-sans text-body-sm text-midnight-400">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Field — labelled input wrapper with consistent a11y wiring.
 * ------------------------------------------------------------------------- */

interface FieldProps {
  name: keyof CheckoutFormData
  label: string
  required?: boolean
  type?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  register: UseFormRegister<CheckoutFormData>
  errors: FieldErrors<CheckoutFormData>
  hint?: string
  className?: string
}

function Field({
  name,
  label,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  register,
  errors,
  hint,
  className,
}: FieldProps) {
  const id = `co-${String(name)}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const error = errors[name]
  const errorMessage = typeof error?.message === 'string' ? error.message : undefined
  const describedBy =
    [errorMessage ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
      >
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required || undefined}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy}
        error={Boolean(errorMessage)}
        {...register(name)}
      />
      {hint && !errorMessage ? (
        <p id={hintId} className="text-xs text-midnight-400">
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-coral"
        >
          <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * PayPal monogram — tiny inline SVG so we don't pull a logo dependency.
 * ------------------------------------------------------------------------- */

function PayPalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn('h-5 w-5', className)}
    >
      <path
        fill="#003087"
        d="M11.6 5.7h6.7c3.1 0 5.4 1.1 5.4 4.1 0 .4 0 .8-.1 1.2-.9 4.4-3.9 6-7.7 6h-1.6c-.5 0-1 .3-1.1.8L12 23.2H7l3.5-15c.1-.4.4-.6.8-.6h.3z"
      />
      <path
        fill="#0070BA"
        d="M14.9 9.7h5.7c3 0 4.9 1.4 4.9 4 0 .4 0 .9-.1 1.4-.8 4.5-3.7 6.6-7.7 6.6h-1.7c-.5 0-1 .3-1.1.8L13.7 26h-5l2.8-12.1c.2-.4.5-.7.9-.7h.3l.5-2.6c.1-.5.5-.9 1-.9z"
      />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
 * The form itself
 * ------------------------------------------------------------------------- */

interface CheckoutFormProps {
  /** Pre-filled from Google profile — name and email are read-only hints */
  initialProfile?: CheckoutInitialProfile
}

export function CheckoutForm({ initialProfile }: CheckoutFormProps) {
  const router = useRouter()
  const { state, breakdown } = useBooking()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const errorBannerId = useId()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...checkoutFormDefaults,
      ...(initialProfile ?? {}),
      specialRequests: state.specialRequests ?? '',
    },
    mode: 'onBlur',
  })

  const paymentMethod = watch('paymentMethod')
  const paymentOption = watch('paymentOption')
  const customAmountUSD = watch('customAmountUSD')
  const specialRequestsLength = (watch('specialRequests') ?? '').length


  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitError(null)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            checkIn: state.checkIn,
            checkOut: state.checkOut,
            guests: state.guests,
            selectedExperiences: state.selectedExperiences,
            specialRequests: data.specialRequests || state.specialRequests || '',
          },
          customer: data,
        }),
      })

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(errorBody?.error ?? 'We could not process your booking. Please try again.')
      }

      const payload = (await response.json()) as {
        reservationId?: string
        redirectUrl?: string
        // Phase E will return `url` instead — handled here for forward-compat.
        url?: string
      }

      // Phase E will return a third-party hosted URL (Stripe Checkout
      // Session, PayPal Orders, …). Until then we use the Next router
      // for an in-app navigation to /booking/success.
      if (payload.url) {
        window.location.href = payload.url
        return
      }
      if (payload.redirectUrl) {
        router.push(payload.redirectUrl)
        return
      }
      throw new Error('Unexpected response from checkout endpoint.')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      setSubmitError(message)
    }
  }

  // Label shown on the submit button — reflects the actual charge.
  const chargeLabel: string = (() => {
    if (paymentOption === 'full') {
      return `Pay ${formatUSD(breakdown.total)} — Pay in full`
    }
    if (paymentOption === 'custom') {
      const amt = customAmountUSD && customAmountUSD > 0 ? formatUSD(customAmountUSD) : 'your amount'
      return `Pay ${amt}`
    }
    return `Pay ${formatUSD(breakdown.depositAmount)} deposit`
  })()

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-describedby={submitError ? errorBannerId : undefined}
      className="flex flex-col gap-8 rounded-2xl border border-pearl-400 bg-pearl p-6 shadow-soft sm:p-8"
    >
      {/* ─── 1 · Contact information ────────────────────────────────── */}
      <section aria-labelledby="section-contact" className="flex flex-col gap-5">
        <SectionHeader
          step={1}
          title="Contact information"
          description="We'll send your confirmation and pre-arrival details to this email."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
            register={register}
            errors={errors}
          />
          <Field
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            required
            register={register}
            errors={errors}
          />
          <Field
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            register={register}
            errors={errors}
          />
          <Field
            name="phone"
            label="Phone / WhatsApp"
            type="tel"
            inputMode="tel"
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
            required
            hint="Used only for urgent matters and experience coordination."
            register={register}
            errors={errors}
          />
        </div>
      </section>

      {/* ─── 2 · Address ────────────────────────────────────────────── */}
      <section
        aria-labelledby="section-address"
        className="flex flex-col gap-5 border-t border-pearl-400 pt-8"
      >
        <SectionHeader step={2} title="Address" description="Billing address for the receipt." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="co-country"
              className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
            >
              Country<span className="text-coral"> *</span>
            </label>
            <select
              id="co-country"
              autoComplete="country"
              aria-invalid={errors.country ? true : undefined}
              aria-describedby={errors.country ? 'co-country-error' : undefined}
              className={cn(
                'flex h-12 w-full rounded-lg border border-lagoon/20 bg-pearl px-3 py-3 font-sans text-body-md text-midnight',
                'transition-colors duration-200',
                'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
                errors.country && 'border-coral focus:border-coral focus:ring-coral/30',
              )}
              {...register('country')}
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country?.message ? (
              <p
                id="co-country-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs font-medium text-coral"
              >
                <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
                {String(errors.country.message)}
              </p>
            ) : null}
          </div>
          <Field
            name="city"
            label="City"
            autoComplete="address-level2"
            required
            register={register}
            errors={errors}
          />
          <Field
            name="zipCode"
            label="ZIP / Postal code"
            autoComplete="postal-code"
            register={register}
            errors={errors}
          />
        </div>
      </section>

      {/* ─── 3 · Travel details (optional) ─────────────────────────── */}
      <section
        aria-labelledby="section-travel"
        className="flex flex-col gap-5 border-t border-pearl-400 pt-8"
      >
        <SectionHeader
          step={3}
          title="Travel details"
          description="Optional — helps our concierge prepare your arrival."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            name="arrivalFlight"
            label="Arrival flight (optional)"
            placeholder="e.g. UA117 — Jul 15, 2026"
            register={register}
            errors={errors}
          />
          <Field
            name="departureFlight"
            label="Departure flight (optional)"
            placeholder="e.g. UA118 — Jul 22, 2026"
            register={register}
            errors={errors}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="co-specialRequests"
            className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400"
          >
            Special requests
          </label>
          <textarea
            id="co-specialRequests"
            rows={4}
            maxLength={1000}
            placeholder="Honeymoon? Dietary restrictions? Anything we should know."
            aria-invalid={errors.specialRequests ? true : undefined}
            aria-describedby="co-specialRequests-hint"
            className={cn(
              'flex w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-body-md text-midnight',
              'placeholder:text-midnight-300',
              'transition-colors duration-200',
              'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
              errors.specialRequests && 'border-coral focus:border-coral focus:ring-coral/30',
            )}
            {...register('specialRequests')}
          />
          <p
            id="co-specialRequests-hint"
            className="flex items-center justify-between text-xs text-midnight-400"
          >
            <span>Stays under 1000 characters.</span>
            <span aria-live="polite">{specialRequestsLength}/1000</span>
          </p>
          {typeof errors.specialRequests?.message === 'string' ? (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-xs font-medium text-coral"
            >
              <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
              {errors.specialRequests.message}
            </p>
          ) : null}
        </div>
      </section>

      {/* ─── 4 · Payment amount ─────────────────────────────────────── */}
      <section
        aria-labelledby="section-payment-amount"
        className="flex flex-col gap-5 border-t border-pearl-400 pt-8"
      >
        <SectionHeader
          step={4}
          title="Payment amount"
          description="Choose how much you'd like to pay today. The remaining balance is due 30 days before arrival."
        />

        <fieldset
          aria-invalid={errors.paymentOption ? true : undefined}
          className="flex flex-col gap-3"
        >
          <legend className="sr-only">Payment amount</legend>

          <PaymentAmountOption
            id="po-deposit"
            value="deposit"
            label="Deposit (30%)"
            description="Minimum required to confirm your reservation"
            amount={formatUSD(breakdown.depositAmount)}
            checked={paymentOption === 'deposit'}
            onSelect={() => setValue('paymentOption', 'deposit', { shouldValidate: true })}
            register={register('paymentOption')}
          />

          <PaymentAmountOption
            id="po-custom"
            value="custom"
            label="Custom amount"
            description="Pay more than the deposit — balance adjusted accordingly"
            checked={paymentOption === 'custom'}
            onSelect={() => setValue('paymentOption', 'custom', { shouldValidate: true })}
            register={register('paymentOption')}
          >
            {paymentOption === 'custom' ? (
              <div className="mt-3 flex flex-col gap-1.5">
                <label
                  htmlFor="co-customAmountUSD"
                  className="text-eyebrow text-xs font-medium uppercase tracking-widest2 text-midnight-400"
                >
                  Amount to pay today (USD)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-sans text-midnight-400">
                    $
                  </span>
                  <input
                    id="co-customAmountUSD"
                    type="number"
                    min={breakdown.depositAmount}
                    max={breakdown.total}
                    step="0.01"
                    placeholder={String(breakdown.depositAmount)}
                    aria-invalid={errors.customAmountUSD ? true : undefined}
                    className={cn(
                      'flex h-12 w-full rounded-lg border border-lagoon/20 bg-pearl pl-7 pr-3 font-sans text-body-md text-midnight',
                      'transition-colors duration-200',
                      'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
                      errors.customAmountUSD && 'border-coral focus:border-coral focus:ring-coral/30',
                    )}
                    {...register('customAmountUSD', { valueAsNumber: true })}
                  />
                </div>
                <p className="font-sans text-xs text-midnight-400">
                  Min {formatUSD(breakdown.depositAmount)} · Max {formatUSD(breakdown.total)}
                </p>
                {typeof errors.customAmountUSD?.message === 'string' ? (
                  <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-coral">
                    <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
                    {errors.customAmountUSD.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </PaymentAmountOption>

          <PaymentAmountOption
            id="po-full"
            value="full"
            label="Pay in full"
            description="No balance due — simplify your pre-arrival admin"
            amount={formatUSD(breakdown.total)}
            checked={paymentOption === 'full'}
            onSelect={() => setValue('paymentOption', 'full', { shouldValidate: true })}
            register={register('paymentOption')}
          />
        </fieldset>

        {typeof errors.paymentOption?.message === 'string' ? (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-coral">
            <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
            {errors.paymentOption.message}
          </p>
        ) : null}
      </section>

      {/* ─── 5 · Payment method ─────────────────────────────────────── */}
      <section
        aria-labelledby="section-payment"
        className="flex flex-col gap-5 border-t border-pearl-400 pt-8"
      >
        <SectionHeader
          step={5}
          title="Payment method"
          description="Choose how you'd like to pay. The balance is due 30 days before arrival."
        />

        <fieldset
          aria-invalid={errors.paymentMethod ? true : undefined}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <legend className="sr-only">Payment method</legend>
          <PaymentOption
            id="pay-stripe"
            value="stripe"
            label="Credit / debit card"
            description="Visa, Mastercard, Amex — no account needed"
            checked={paymentMethod === 'stripe'}
            onSelect={() =>
              setValue('paymentMethod', 'stripe', { shouldValidate: true })
            }
            icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
            register={register('paymentMethod')}
          />
          <PaymentOption
            id="pay-paypal"
            value="paypal"
            label="PayPal"
            description="Pay with your PayPal balance or linked card"
            checked={paymentMethod === 'paypal'}
            onSelect={() =>
              setValue('paymentMethod', 'paypal', { shouldValidate: true })
            }
            icon={<PayPalMark />}
            register={register('paymentMethod')}
          />
        </fieldset>
        {typeof errors.paymentMethod?.message === 'string' ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-coral"
          >
            <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
            {errors.paymentMethod.message}
          </p>
        ) : null}
      </section>

      {/* ─── 6 · Acknowledgments ────────────────────────────────────── */}
      <section
        aria-labelledby="section-ack"
        className="flex flex-col gap-3 border-t border-pearl-400 pt-8"
      >
        <SectionHeader step={6} title="Confirm and agree" />
        <Acknowledgment
          name="acceptTerms"
          register={register}
          error={errors.acceptTerms?.message as string | undefined}
        >
          I have read and accept the{' '}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-lagoon underline-offset-2 hover:underline focus-visible:underline"
          >
            Terms of Service
          </a>
          .
        </Acknowledgment>
        <Acknowledgment
          name="acceptCancellation"
          register={register}
          error={errors.acceptCancellation?.message as string | undefined}
        >
          I understand the{' '}
          <a
            href="/legal/cancellation"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-lagoon underline-offset-2 hover:underline focus-visible:underline"
          >
            cancellation policy
          </a>{' '}
          (100% refund more than 60 days before arrival).
        </Acknowledgment>
        <Acknowledgment name="acceptMarketing" register={register} optional>
          I'd like to receive Villa Paradise updates and travel inspiration (you can opt out at any time).
        </Acknowledgment>
      </section>

      {/* ─── Submission ─────────────────────────────────────────────── */}
      {submitError ? (
        <div
          id={errorBannerId}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-body-sm text-midnight"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-coral" aria-hidden="true" />
          <p className="font-sans">{submitError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          aria-disabled={isSubmitting || undefined}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>Continue to payment — {chargeLabel}</span>
            </>
          )}
        </Button>
        <p className="text-center text-xs text-midnight-400">
          You will not be charged until your payment is confirmed on the next page.
        </p>
      </div>
    </form>
  )
}

/* ---------------------------------------------------------------------------
 * Sub-components — payment option card + checkbox
 * ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * Payment amount option card
 * ------------------------------------------------------------------------- */

interface PaymentAmountOptionProps {
  id: string
  value: 'deposit' | 'custom' | 'full'
  label: string
  description: string
  amount?: string
  checked: boolean
  onSelect: () => void
  register: ReturnType<UseFormRegister<CheckoutFormData>>
  children?: React.ReactNode
}

function PaymentAmountOption({
  id,
  value,
  label,
  description,
  amount,
  checked,
  onSelect,
  register,
  children,
}: PaymentAmountOptionProps) {
  return (
    <label
      htmlFor={id}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer flex-col gap-0 rounded-xl border bg-pearl p-4 text-left transition-all',
        'hover:border-gold hover:shadow-soft',
        'focus-within:ring-2 focus-within:ring-gold/30',
        checked ? 'border-gold bg-gold/5 shadow-soft' : 'border-pearl-400',
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          id={id}
          value={value}
          className="sr-only"
          {...register}
        />
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border',
            checked ? 'border-gold bg-gold' : 'border-pearl-500 bg-pearl',
          )}
        >
          {checked ? <span className="h-2 w-2 rounded-full bg-midnight" /> : null}
        </span>
        <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-midnight">{label}</span>
            <span className="font-sans text-xs text-midnight-400">{description}</span>
          </div>
          {amount ? (
            <span className="flex-none font-heading text-base font-semibold text-midnight">
              {amount}
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </label>
  )
}

interface PaymentOptionProps {
  id: string
  value: 'stripe' | 'paypal'
  label: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onSelect: () => void
  /** RHF registration so the native input value reaches react-hook-form. */
  register: ReturnType<UseFormRegister<CheckoutFormData>>
}

function PaymentOption({
  id,
  value,
  label,
  description,
  icon,
  checked,
  onSelect,
  register,
}: PaymentOptionProps) {
  return (
    <label
      htmlFor={id}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border bg-pearl p-4 text-left transition-all',
        'hover:border-gold hover:shadow-soft',
        'focus-within:ring-2 focus-within:ring-gold/30',
        checked
          ? 'border-gold bg-gold/5 shadow-soft'
          : 'border-pearl-400',
      )}
    >
      <input
        type="radio"
        id={id}
        value={value}
        className="sr-only"
        {...register}
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border',
          checked
            ? 'border-gold bg-gold'
            : 'border-pearl-500 bg-pearl',
        )}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-midnight" /> : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading text-base font-semibold text-midnight">
            {label}
          </span>
          <span aria-hidden="true" className="flex-none text-midnight-400">
            {icon}
          </span>
        </div>
        <span className="font-sans text-xs text-midnight-400">{description}</span>
      </div>
    </label>
  )
}

interface AcknowledgmentProps {
  name: 'acceptTerms' | 'acceptCancellation' | 'acceptMarketing'
  register: UseFormRegister<CheckoutFormData>
  error?: string
  optional?: boolean
  children: React.ReactNode
}

function Acknowledgment({ name, register, error, optional, children }: AcknowledgmentProps) {
  const id = `co-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-body-sm text-midnight"
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'mt-0.5 h-4 w-4 flex-none rounded border border-pearl-500 text-gold accent-gold',
            'focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-1',
            error && 'border-coral',
          )}
          {...register(name)}
        />
        <span className="font-sans leading-snug">
          {children}
          {!optional ? <span className="text-coral"> *</span> : null}
        </span>
      </label>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="ml-7 flex items-center gap-1.5 text-xs font-medium text-coral"
        >
          <AlertCircle className="h-3 w-3 flex-none" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
