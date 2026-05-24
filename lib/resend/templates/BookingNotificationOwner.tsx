/**
 * BookingNotificationOwner — React Email template (Phase E1).
 *
 * Sent to the owner inbox (Thierry) whenever a guest reservation is
 * confirmed. Optimized for fast scanning on mobile: large reservation id,
 * key dates, total, and a CTA back to the Sanity Studio so the owner can
 * see the record in context.
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
  leaf: '#2E7D5B',
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
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

interface Props {
  data: BookingConfirmationData
  paymentMethod: 'stripe' | 'paypal'
  siteUrl: string
}

export function BookingNotificationOwner({
  data,
  paymentMethod,
  siteUrl,
}: Props) {
  const { customer, booking, breakdown, selectedExperiences, reservationId } =
    data

  return (
    <Html>
      <Head />
      <Preview>
        {`New booking ${reservationId} — ${customer.firstName} ${customer.lastName} (${formatUSD(breakdown.total)})`}
      </Preview>
      <Body
        style={{
          backgroundColor: COLORS.pearl,
          margin: 0,
          padding: '24px 0',
          fontFamily: FONT_SANS,
          color: COLORS.midnight,
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '32px 28px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.sand}`,
          }}
        >
          {/* Status banner */}
          <Section
            style={{
              backgroundColor: COLORS.leaf,
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              New booking received
            </Text>
          </Section>

          <Heading
            as="h1"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: '26px',
              fontWeight: 400,
              color: COLORS.midnight,
              margin: '0 0 4px',
              lineHeight: 1.2,
            }}
          >
            {reservationId}
          </Heading>
          <Text
            style={{
              fontSize: '14px',
              color: COLORS.midnight400,
              margin: '0 0 24px',
            }}
          >
            Paid via{' '}
            <strong style={{ color: COLORS.midnight }}>
              {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
            </strong>{' '}
            · {formatUSD(breakdown.depositAmount)} deposit collected
          </Text>

          {/* Guest */}
          <Section style={sectionTitleStyle}>
            <Text style={eyebrowStyle}>Guest</Text>
            <Text style={bodyTextStyle}>
              <strong>
                {customer.firstName} {customer.lastName}
              </strong>
              <br />
              <Link
                href={`mailto:${customer.email}`}
                style={{ color: COLORS.lagoon }}
              >
                {customer.email}
              </Link>
            </Text>
          </Section>

          <Hr style={{ borderColor: COLORS.sand, margin: '20px 0' }} />

          {/* Dates */}
          <Section>
            <Text style={eyebrowStyle}>Stay</Text>
            <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
            <DetailRow
              label="Guests"
              value={`${booking.guests} (${booking.nights} nights)`}
            />
          </Section>

          {selectedExperiences.length > 0 ? (
            <>
              <Hr style={{ borderColor: COLORS.sand, margin: '20px 0' }} />
              <Section>
                <Text style={eyebrowStyle}>Experiences</Text>
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

          <Hr style={{ borderColor: COLORS.sand, margin: '20px 0' }} />

          <Section>
            <Text style={eyebrowStyle}>Breakdown</Text>
            <DetailRow label="Villa" value={formatUSD(breakdown.villaSubtotal)} />
            {breakdown.experiencesTotal > 0 ? (
              <DetailRow
                label="Experiences"
                value={formatUSD(breakdown.experiencesTotal)}
              />
            ) : null}
            <DetailRow
              label="Cleaning"
              value={formatUSD(breakdown.cleaningFee)}
            />
            <Hr style={{ borderColor: COLORS.sand, margin: '8px 0' }} />
            <DetailRow
              label="Total"
              value={formatUSD(breakdown.total)}
              strong
            />
            <DetailRow
              label="Deposit collected"
              value={formatUSD(breakdown.depositAmount)}
            />
            <DetailRow
              label="Balance due"
              value={formatUSD(breakdown.balanceAmount)}
            />
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            <Link
              href={`${siteUrl}/studio`}
              style={{
                display: 'inline-block',
                backgroundColor: COLORS.gold,
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textDecoration: 'none',
              }}
            >
              Open Studio
            </Link>
          </Section>

          <Text
            style={{
              fontSize: '12px',
              color: COLORS.midnight400,
              textAlign: 'center',
              margin: '16px 0 0',
            }}
          >
            Reply directly to{' '}
            <Link
              href={`mailto:${customer.email}`}
              style={{ color: COLORS.lagoon }}
            >
              {customer.email}
            </Link>{' '}
            to reach the guest.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/* ---------- shared styles + helpers -------------------------------------- */

const eyebrowStyle = {
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: COLORS.gold,
  margin: '0 0 10px',
}

const bodyTextStyle = {
  fontSize: '15px',
  lineHeight: 1.6,
  color: COLORS.midnight,
  margin: 0,
}

const sectionTitleStyle = {
  margin: 0,
}

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
      style={{ margin: '0 0 6px' }}
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

export default BookingNotificationOwner
