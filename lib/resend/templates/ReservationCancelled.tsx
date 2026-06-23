/**
 * ReservationCancelled — React Email template.
 *
 * Guest-facing notice sent when an admin cancels a reservation from the
 * back-office. Tone: courteous, clear, reassuring about next steps. Reply-to is
 * the owner inbox so the guest can respond directly.
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

import type { ReservationCancelledData } from '../types'

const COLORS = {
  midnight: '#1A2A3A',
  midnight400: '#5A6B7E',
  gold: '#C9A84C',
  coral: '#C2410C',
  sand: '#F5E6C8',
  pearl: '#FBF7F0',
  lagoon: '#1B8FA8',
} as const

const FONT_HEADING =
  '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif'
const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

interface Props {
  data: ReservationCancelledData
  siteUrl: string
}

export function ReservationCancelled({ data, siteUrl }: Props) {
  const { reservationId, customer, booking, reason } = data

  return (
    <Html>
      <Head />
      <Preview>Your Villa Paradise Tahiti reservation {reservationId} has been cancelled</Preview>
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
              fontSize: '28px',
              fontWeight: 400,
              color: COLORS.midnight,
              textAlign: 'center',
              margin: '8px 0 24px',
              lineHeight: 1.2,
            }}
          >
            Your reservation has been cancelled.
          </Heading>

          <Text style={{ fontSize: '16px', lineHeight: 1.7, color: COLORS.midnight, margin: '0 0 16px' }}>
            Dear{customer.firstName ? ` ${customer.firstName}` : ' guest'},
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: 1.7, color: COLORS.midnight400, margin: '0 0 20px' }}>
            We&apos;re writing to confirm that your reservation has been cancelled. We&apos;re sorry
            it won&apos;t be going ahead this time.
          </Text>

          <Section
            style={{
              backgroundColor: COLORS.pearl,
              border: `1px solid ${COLORS.sand}`,
              borderRadius: '8px',
              padding: '16px 20px',
              margin: '0 0 20px',
            }}
          >
            <Text style={{ fontSize: '14px', lineHeight: 1.8, color: COLORS.midnight, margin: 0 }}>
              <strong>Reservation:</strong> {reservationId}
              <br />
              <strong>Dates:</strong> {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </Text>
            {reason ? (
              <Text style={{ fontSize: '14px', lineHeight: 1.7, color: COLORS.coral, margin: '10px 0 0' }}>
                <strong>Reason:</strong> {reason}
              </Text>
            ) : null}
          </Section>

          <Text style={{ fontSize: '16px', lineHeight: 1.7, color: COLORS.midnight400, margin: '0 0 16px' }}>
            Any payment made will be refunded in accordance with our cancellation policy. If you have
            any question, simply reply to this email — we&apos;ll get back to you personally.
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: 1.7, color: COLORS.midnight400, margin: '0 0 8px' }}>
            We&apos;d be delighted to welcome you another time.
          </Text>

          <Hr style={{ borderColor: COLORS.sand, margin: '32px 0 16px' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '12px', color: COLORS.midnight400, margin: '0 0 8px' }}>
              Villa Paradise Tahiti · Punaauia, French Polynesia
            </Text>
            <Text style={{ fontSize: '12px', margin: 0 }}>
              <Link href={siteUrl} style={{ color: COLORS.lagoon, marginRight: 12 }}>
                Website
              </Link>
              <Link href={`${siteUrl}/cancellation`} style={{ color: COLORS.lagoon }}>
                Cancellation policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ReservationCancelled
