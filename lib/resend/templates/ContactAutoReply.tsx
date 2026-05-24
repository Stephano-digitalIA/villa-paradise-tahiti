/**
 * ContactAutoReply — React Email template (Phase E1).
 *
 * Auto-acknowledgement sent to a visitor immediately after they submit
 * the `/contact` form. Tone: warm, confident, short. The promise we make
 * here ("within 4 hours, Tahiti time") matches the inbox SLA shown in the
 * success state of the ContactForm.
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
  firstName: string
  siteUrl: string
}

export function ContactAutoReply({ firstName, siteUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>We&apos;ve received your inquiry — Villa Paradise Tahiti</Preview>
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
              fontSize: '30px',
              fontWeight: 400,
              color: COLORS.midnight,
              textAlign: 'center',
              margin: '8px 0 24px',
              lineHeight: 1.2,
            }}
          >
            We&apos;ve received your inquiry.
          </Heading>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: COLORS.midnight,
              margin: '0 0 16px',
            }}
          >
            Thank you{firstName ? `, ${firstName}` : ''}, for reaching out.
          </Text>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: COLORS.midnight400,
              margin: '0 0 16px',
            }}
          >
            Our concierge team will respond personally{' '}
            <strong style={{ color: COLORS.midnight }}>
              within 4 hours
            </strong>
            , Monday to Sunday, Tahiti time (UTC−10).
          </Text>

          <Text
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: COLORS.midnight400,
              margin: '0 0 24px',
            }}
          >
            While you wait, you may enjoy a glimpse of what awaits — a
            selection of curated experiences crafted for our guests alone.
          </Text>

          <Section style={{ textAlign: 'center', margin: '0 0 8px' }}>
            <Link
              href={`${siteUrl}/experiences`}
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
              Discover the experiences
            </Link>
          </Section>

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
                href={`${siteUrl}/villa`}
                style={{ color: COLORS.lagoon, marginRight: 12 }}
              >
                The Villa
              </Link>
              <Link
                href={`${siteUrl}/rates`}
                style={{ color: COLORS.lagoon }}
              >
                Rates
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ContactAutoReply
