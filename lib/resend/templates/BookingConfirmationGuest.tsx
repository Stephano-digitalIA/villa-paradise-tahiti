/**
 * BookingConfirmationGuest — React Email template (Phase E1).
 *
 * Sent to the guest after a successful payment (Phase E2 will trigger it
 * from the Stripe / PayPal webhook handler). Tone: luxury US, warm but
 * understated. Keeps the email parseable on any mail client by leaning on
 * React Email's `Container`, `Section`, `Text` primitives instead of raw
 * `<div>` soups.
 *
 * Brand palette (kept in sync with `tailwind.config.ts`):
 *   - midnight  #1A2A3A   primary text + headings
 *   - gold      #C9A84C   accents + CTA background
 *   - sand      #F5E6C8   subtle dividers / surfaces
 *   - pearl     #FBF7F0   page background
 */

import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import type { BookingConfirmationData } from '../types'

const COLORS = {
  midnight: '#1A2A3A',
  midnight400: '#5A6B7E',
  gold: '#C9A84C',
  sand: '#F5E6C8',
  pearl: '#FBF7F0',
  lagoon: '#1B8FA8',
} as const

const FONT_HEADING =
  '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

function formatUSD(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatDate(iso: string): string {
  // We accept the ISO YYYY-MM-DD string as-is; constructing a `Date` here
  // would risk a timezone shift. Email clients render this consistently.
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

interface Props {
  data: BookingConfirmationData
  siteUrl: string
}

export function BookingConfirmationGuest({ data, siteUrl }: Props) {
  const { customer, booking, breakdown, selectedExperiences, reservationId } =
    data

  return (
    <Html>
      <Head />
      <Preview>
        {`Your Villa Paradise Tahiti reservation ${reservationId} is confirmed`}
      </Preview>
      <Body
        style={{
          backgroundColor: COLORS.pearl,
          margin: 0,
          padding: '32px 0',
          fontFamily: FONT_SANS,
          color: COLORS.midnight,
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px 32px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.sand}`,
          }}
        >
          {/* Wordmark */}
          <Section style={{ textAlign: 'center', marginBottom: '8px' }}>
            <Text
              style={{
                fontFamily: FONT_HEADING,
                fontSize: '14px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: COLORS.gold,
                margin: 0,
              }}
            >
              Villa Paradise Tahiti
            </Text>
          </Section>

          <Heading
            as="h1"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: '32px',
              fontWeight: 400,
              color: COLORS.midnight,
              textAlign: 'center',
              margin: '8px 0 24px',
              lineHeight: 1.2,
            }}
          >
            Thank you, {customer.firstName}.
          </Heading>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: COLORS.midnight400,
              margin: '0 0 8px',
            }}
          >
            Your reservation is confirmed. We are honored to welcome you to
            Tahiti — every detail is being prepared to make your stay
            effortless.
          </Text>

          <Text
            style={{
              fontSize: '14px',
              color: COLORS.midnight400,
              margin: '0 0 32px',
            }}
          >
            Reservation reference:{' '}
            <strong style={{ color: COLORS.midnight }}>{reservationId}</strong>
          </Text>

          <Hr style={{ borderColor: COLORS.sand, margin: '0 0 24px' }} />

          {/* Stay summary */}
          <Section>
            <Text
              style={{
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.gold,
                margin: '0 0 12px',
              }}
            >
              Your Stay
            </Text>
            <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
            <DetailRow
              label="Guests"
              value={`${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`}
            />
            <DetailRow
              label="Nights"
              value={`${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`}
            />
          </Section>

          {/* Experiences */}
          {selectedExperiences.length > 0 ? (
            <>
              <Hr style={{ borderColor: COLORS.sand, margin: '24px 0' }} />
              <Section>
                <Text
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: COLORS.gold,
                    margin: '0 0 12px',
                  }}
                >
                  Curated Experiences
                </Text>
                {selectedExperiences.map((xp, idx) => (
                  <DetailRow
                    key={idx}
                    label={xp.title}
                    value={`× ${xp.quantity}`}
                  />
                ))}
              </Section>
            </>
          ) : null}

          {/* Price breakdown */}
          <Hr style={{ borderColor: COLORS.sand, margin: '24px 0' }} />
          <Section>
            <Text
              style={{
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.gold,
                margin: '0 0 12px',
              }}
            >
              Investment
            </Text>
            <DetailRow
              label="Villa"
              value={formatUSD(breakdown.villaSubtotal)}
            />
            {breakdown.experiencesTotal > 0 ? (
              <DetailRow
                label="Experiences"
                value={formatUSD(breakdown.experiencesTotal)}
              />
            ) : null}
            <DetailRow
              label="Cleaning fee"
              value={formatUSD(breakdown.cleaningFee)}
            />
            <Hr style={{ borderColor: COLORS.sand, margin: '12px 0' }} />
            <DetailRow
              label="Total"
              value={formatUSD(breakdown.total)}
              strong
            />
            <DetailRow
              label="Deposit paid"
              value={formatUSD(breakdown.depositAmount)}
            />
            <DetailRow
              label="Balance due (30 days before arrival)"
              value={formatUSD(breakdown.balanceAmount)}
            />
          </Section>

          {/* What's next */}
          <Hr style={{ borderColor: COLORS.sand, margin: '24px 0' }} />
          <Section>
            <Text
              style={{
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: COLORS.gold,
                margin: '0 0 12px',
              }}
            >
              What's Next
            </Text>
            <Text
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: COLORS.midnight,
                margin: '0 0 12px',
              }}
            >
              You will receive your detailed check-in instructions —
              including driver pickup, villa access, and a personalized
              itinerary preview — exactly <strong>7 days before arrival</strong>.
            </Text>
            <Text
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: COLORS.midnight,
                margin: '0 0 12px',
              }}
            >
              In the meantime, our concierge team is at your service. Reply
              directly to this email or write to{' '}
              <Link
                href="mailto:villaparadisetahiti@gmail.com"
                style={{ color: COLORS.lagoon, textDecoration: 'underline' }}
              >
                villaparadisetahiti@gmail.com
              </Link>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: COLORS.sand, margin: '32px 0 16px' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '12px',
                color: COLORS.midnight400,
                margin: '0 0 8px',
              }}
            >
              Villa Paradise Tahiti · Punaauia, French Polynesia
            </Text>
            <Text style={{ fontSize: '12px', margin: 0 }}>
              <Link
                href={siteUrl}
                style={{ color: COLORS.lagoon, marginRight: 12 }}
              >
                Website
              </Link>
              <Link
                href={`${siteUrl}/experiences`}
                style={{ color: COLORS.lagoon, marginRight: 12 }}
              >
                Experiences
              </Link>
              <Link
                href={`${siteUrl}/contact`}
                style={{ color: COLORS.lagoon }}
              >
                Contact
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/* ---------- internal helper ---------------------------------------------- */

function DetailRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: '0 0 8px' }}
    >
      <tbody>
        <tr>
          <td
            style={{
              fontSize: '14px',
              color: COLORS.midnight400,
              padding: '2px 0',
            }}
          >
            {label}
          </td>
          <td
            align="right"
            style={{
              fontSize: '14px',
              color: COLORS.midnight,
              fontWeight: strong ? 700 : 500,
              padding: '2px 0',
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default BookingConfirmationGuest
