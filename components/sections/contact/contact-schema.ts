/**
 * Contact form Zod schema — Villa Paradise Tahiti.
 *
 * Source of truth for both client-side validation (react-hook-form +
 * zodResolver) and the eventual server-side handler (Resend integration
 * in Phase E). Co-locating the schema with the section keeps the
 * contract close to the UI; Phase E will import this same schema from
 * the API route to validate the inbound payload before sending the
 * notification email.
 *
 * Design notes:
 *  - Field names are camelCase and English (US market default).
 *  - Optional fields are typed as `string` (possibly empty) at input
 *    time — we don't transform to `undefined` because react-hook-form's
 *    default value contract works best with strings throughout. The
 *    server-side handler can normalise empties before sending.
 *  - Date fields are stored as ISO `YYYY-MM-DD` strings to match the
 *    native `<input type="date">` value.
 *  - `guests` accepts a string from the input and validates as a
 *    positive integer when provided. Empty string is allowed.
 *  - `message` requires a minimum of 20 chars to filter spammy
 *    one-liners while staying low-friction for genuine inquiries.
 */

import { z } from 'zod'

const optionalString = z
  .string()
  .trim()
  .max(120, { message: 'Value is too long.' })
  .optional()
  .default('')

export const contactFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: 'Please enter your full name (2 characters minimum).' })
      .max(120, { message: 'Name is too long.' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Please enter a valid email address.' })
      .max(160, { message: 'Email is too long.' }),
    phone: optionalString,
    checkIn: optionalString,
    checkOut: optionalString,
    guests: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!value) return true
          const num = Number(value)
          return Number.isInteger(num) && num >= 1 && num <= 24
        },
        { message: 'Please enter a number between 1 and 24.' }
      )
      .optional()
      .default(''),
    message: z
      .string()
      .trim()
      .min(20, { message: 'Please share a few more details (20 characters minimum).' })
      .max(2000, { message: 'Message is too long (2000 characters maximum).' }),
  })
  .refine(
    (data) => {
      // If both dates are provided, check-out must be after check-in.
      if (!data.checkIn || !data.checkOut) return true
      return data.checkOut > data.checkIn
    },
    {
      path: ['checkOut'],
      message: 'Check-out date must be after check-in date.',
    }
  )

export type ContactFormValues = z.infer<typeof contactFormSchema>
export type ContactFormInput = z.input<typeof contactFormSchema>
