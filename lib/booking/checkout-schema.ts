/**
 * Checkout form schema — Villa Paradise Tahiti (Phase D2).
 *
 * Single source of truth for the customer form that follows the
 * `BookingState` calculator. Used by:
 *   - `components/booking/checkout/CheckoutForm.tsx` (react-hook-form resolver)
 *   - `app/api/checkout/route.ts` (server-side validation before payment)
 *
 * Design notes:
 *  - Field copy and constraints target the **US** market (cf.
 *    `docs/03-cible-marche-us.md`) — short, clear, non-jargon.
 *  - The `paymentMethod` enum mirrors the payment processors we plan to
 *    wire in Phase E (Stripe + PayPal). The same shape works for both.
 *  - `acceptTerms` / `acceptCancellation` use `z.literal(true)` so the
 *    submit button cannot be bypassed by sending `false` from the client.
 *  - Optional fields stay truly optional — `arrivalFlight`, `zipCode`,
 *    `specialRequests`, `acceptMarketing`, `phone` style: the form must not
 *    block on details a US guest may want to skip.
 *
 * Keep this file framework-agnostic (no React, no Sanity) — server routes
 * and CLI scripts must be able to import it.
 */

import { z } from 'zod'

/**
 * Country options exposed by the form. Ordered with **US first** because
 * it's the primary market, then the other big direct-booking source
 * markets, then a generic "Other" sentinel handled by the country field.
 */
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'OTHER', name: 'Other' },
] as const

export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number]['code']

/* ---------------------------------------------------------------------------
 * Zod schema
 * ------------------------------------------------------------------------- */

export const checkoutSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name is required'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name is required'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is required'),
  country: z
    .string()
    .trim()
    .min(2, 'Country is required'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required'),
  zipCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal('')),
  specialRequests: z
    .string()
    .trim()
    .max(1000, 'Please keep your message under 1000 characters')
    .optional()
    .or(z.literal('')),
  arrivalFlight: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal('')),
  departureFlight: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal('')),
  paymentMethod: z.enum(['stripe', 'paypal'], {
    message: 'Choose a payment method',
  }),
  paymentOption: z.enum(['deposit', 'custom', 'full'], {
    message: 'Choose a payment option',
  }),
  customAmountUSD: z.number().positive('Enter a valid amount').optional(),
  acceptTerms: z.literal(true, {
    message: 'You must accept the Terms of Service',
  }),
  acceptCancellation: z.literal(true, {
    message: 'You must acknowledge the cancellation policy',
  }),
  acceptMarketing: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentOption === 'custom' && !data.customAmountUSD) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a custom amount',
      path: ['customAmountUSD'],
    })
  }
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

/**
 * Default values for the form — kept here so the client form and any
 * future test fixtures share the same baseline. Empty strings rather
 * than `undefined` so react-hook-form treats the fields as controlled
 * from the first render.
 */
export const checkoutFormDefaults: Partial<CheckoutFormData> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: 'US',
  city: '',
  zipCode: '',
  specialRequests: '',
  arrivalFlight: '',
  departureFlight: '',
  paymentOption: 'deposit' as const,
  acceptMarketing: false,
}
