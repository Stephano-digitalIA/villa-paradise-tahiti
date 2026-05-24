/**
 * ContactInquiryNotification — React Email template (Phase E1).
 *
 * Sent to the owner inbox whenever the `/contact` page form is submitted.
 * Goal: make Thierry able to reply in under a minute — name + email made
 * tappable, message printed prominently, optional context (dates, guests)
 * gathered in a small detail block underneath.
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

import type { ContactInquiryData } from '../types'

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

interface Props {
  data: ContactInquiryData
}

export function ContactInquiryNotification({ data }: Props) {
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const subjectLineHint = `Re: Your Villa Paradise Tahiti inquiry`
  const mailto = `mailto:${data.email}?subject=${encodeURIComponent(subjectLineHint)}`

  return (
    <Html>
      <Head />
      <Preview>{`New inquiry from ${fullName}`}</Preview>
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
          <Text
            style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: COLORS.gold,
              margin: '0 0 6px',
            }}
          >
            New inquiry
          </Text>
          <Heading
            as="h1"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: '26px',
              fontWeight: 400,
              color: COLORS.midnight,
              margin: '0 0 20px',
              lineHeight: 1.2,
            }}
          >
            {fullName}
          </Heading>

          {/* Message — front and centre */}
          <Section
            style={{
              backgroundColor: COLORS.pearl,
              padding: '20px 20px',
              borderRadius: '4px',
              borderLeft: `3px solid ${COLORS.gold}`,
              margin: '0 0 24px',
            }}
          >
            <Text
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: COLORS.midnight,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {data.message}
            </Text>
          </Section>

          {/* Contact details */}
          <Section>
            <DetailRow
              label="Email"
              valueNode={
                <Link href={mailto} style={{ color: COLORS.lagoon }}>
                  {data.email}
                </Link>
              }
            />
            {data.phone ? (
              <DetailRow label="Phone" value={data.phone} />
            ) : null}
            {data.guests ? (
              <DetailRow label="Guests" value={String(data.guests)} />
            ) : null}
            {data.travelDateFrom || data.travelDateTo ? (
              <DetailRow
                label="Travel dates"
                value={[
                  data.travelDateFrom || '—',
                  data.travelDateTo || '—',
                ].join(' → ')}
              />
            ) : null}
          </Section>

          {/* CTA */}
          <Hr style={{ borderColor: COLORS.sand, margin: '24px 0' }} />
          <Section style={{ textAlign: 'center' }}>
            <Link
              href={mailto}
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
              Reply to {data.firstName}
            </Link>
          </Section>

          <Text
            style={{
              fontSize: '12px',
              color: COLORS.midnight400,
              textAlign: 'center',
              margin: '24px 0 0',
            }}
          >
            Aim to respond within 4 hours (Tahiti time, UTC−10).
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/* ---------- helper ------------------------------------------------------- */

function DetailRow({
  label,
  value,
  valueNode,
}: {
  label: string
  value?: string
  valueNode?: React.ReactNode
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
              fontSize: '13px',
              color: COLORS.midnight400,
              padding: '2px 0',
              width: '40%',
            }}
          >
            {label}
          </td>
          <td
            style={{
              fontSize: '14px',
              color: COLORS.midnight,
              padding: '2px 0',
            }}
          >
            {valueNode ?? value}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default ContactInquiryNotification
