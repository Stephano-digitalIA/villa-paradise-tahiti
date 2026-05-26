import type { Metadata } from 'next'

import { LegalPageHeader } from '@/components/sections/legal'
import { buildMetadata } from '@/lib/seo'

const LAST_UPDATED = 'May 1, 2026'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy — Villa Paradise Tahiti',
  description:
    'How Villa Paradise Tahiti collects, uses, shares, and protects guest information. CCPA-aware US privacy practices.',
  path: '/legal/privacy-policy',
})

/**
 * /legal/privacy-policy — US-compliant draft privacy notice.
 *
 * Drafted with CCPA/CPRA, COPPA, and California "Shine the Light"
 * principles in mind. Every page must keep the pending-counsel
 * disclaimer until a licensed attorney signs off.
 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalPageHeader
        eyebrow="Privacy"
        title="Privacy Policy"
        lastUpdated={LAST_UPDATED}
        intro="This Privacy Policy explains how Villa Paradise Tahiti (collectively, “we,” “our,” or “us”) collects, uses, discloses, and protects your information when you visit villaparadisetahiti.com, book a stay, or contact our concierge team."
      />

      <h2>1. Information we collect</h2>
      <p>
        We collect information that you provide directly, information collected
        automatically when you interact with our website, and information from
        trusted third parties acting on our behalf.
      </p>

      <h3>1.1 Information you provide</h3>
      <ul>
        <li>
          <strong>Identity &amp; contact data:</strong> full name, email
          address, phone number, postal address, and country of residence,
          collected through our inquiry form, booking flow, and customer
          correspondence.
        </li>
        <li>
          <strong>Reservation data:</strong> arrival and departure dates,
          number of guests, room or experience selections, dietary
          restrictions, accessibility needs, and any other notes you share to
          help us tailor the stay.
        </li>
        <li>
          <strong>Payment data:</strong> we do not store full payment card
          numbers on our servers. Card details are entered directly into our
          PCI-DSS Level 1 payment processors (Stripe and PayPal); we receive
          only a token plus the last four digits, expiration month, and a
          truncated authorization response for our records.
        </li>
        <li>
          <strong>Identity verification:</strong> for select bookings we may
          request a copy of a government-issued ID at check-in to comply with
          French Polynesia hospitality registration requirements. Copies are
          retained no longer than legally required.
        </li>
      </ul>

      <h3>1.2 Information collected automatically</h3>
      <ul>
        <li>
          <strong>Device &amp; usage data:</strong> IP address, approximate
          location (city or region only), browser type, operating system,
          referring URL, pages visited, session duration, and aggregated
          interaction data.
        </li>
        <li>
          <strong>Cookies &amp; similar technologies:</strong> first-party
          cookies for essential site functions and consented third-party
          cookies for analytics and marketing. See Section 4 below.
        </li>
      </ul>

      <h3>1.3 Information from third parties</h3>
      <p>
        When you book through a partner channel (such as Airbnb or Vrbo) and
        later interact with us directly, we may receive the contact and
        booking information that channel shared with us, strictly for the
        purpose of servicing your reservation.
      </p>

      <h2>2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>process bookings, deposits, balances, and refunds;</li>
        <li>communicate confirmations, pre-arrival logistics, and on-property updates;</li>
        <li>provide concierge services and coordinate experiences with our partners;</li>
        <li>respond to inquiries submitted through the contact form;</li>
        <li>improve the website, content, and offers based on aggregated analytics;</li>
        <li>send transactional and, where permitted, occasional marketing emails;</li>
        <li>prevent fraud, abuse, and unauthorized access;</li>
        <li>comply with our legal, tax, and accounting obligations.</li>
      </ul>

      <h2>3. How we share information</h2>
      <p>
        We do not sell your personal information in the conventional sense.
        Under the California Consumer Privacy Act (CCPA) as amended by the
        California Privacy Rights Act (CPRA), certain analytics or advertising
        cookie data may be treated as a “sale” or “share”; California
        residents may opt out at any time (see Section 6.4 below).
      </p>
      <p>We disclose information to a limited number of trusted third parties:</p>
      <ul>
        <li>
          <strong>Stripe, Inc.</strong> &mdash; payment processing.
          Stripe&apos;s privacy practices are available at{' '}
          <a href="https://stripe.com/privacy" rel="noopener noreferrer">
            stripe.com/privacy
          </a>
          .
        </li>
        <li>
          <strong>PayPal, Inc.</strong> &mdash; alternative payment processing.
          See{' '}
          <a href="https://www.paypal.com/us/legalhub/privacy-full" rel="noopener noreferrer">
            paypal.com/us/legalhub/privacy-full
          </a>
          .
        </li>
        <li>
          <strong>Resend, Inc.</strong> &mdash; transactional email delivery
          (booking confirmations, password resets, contact-form notifications).
        </li>
        <li>
          <strong>Vercel, Inc.</strong> &mdash; website hosting, edge
          functions, and content delivery. Server logs may include truncated
          IP addresses.
        </li>
        <li>
          <strong>Sanity.io</strong> &mdash; headless CMS hosting editorial
          content. Visitor data is not stored in Sanity.
        </li>
        <li>
          <strong>Google LLC (Google Analytics 4).</strong> &mdash; aggregated
          web analytics. IP anonymization is enabled.
        </li>
        <li>
          <strong>Hotjar Ltd.</strong> &mdash; session replay and heatmaps,
          configured to mask personal data fields by default.
        </li>
        <li>
          <strong>On-island experience partners.</strong> &mdash; when you book
          a snorkeling tour, sunset cruise, or private chef dinner we share
          your first name, party size, dietary notes, and arrival point with
          the relevant operator, and only what is strictly needed to deliver
          the experience.
        </li>
        <li>
          <strong>Professional advisors</strong> (lawyers, accountants,
          auditors) and government authorities when required by law,
          subpoena, or to enforce our Terms of Service.
        </li>
      </ul>

      <h2>4. Cookies and similar technologies</h2>
      <p>We use four categories of cookies:</p>
      <ul>
        <li>
          <strong>Strictly necessary:</strong> required for the site to
          function (language preference, cart contents, fraud detection).
          These cannot be disabled.
        </li>
        <li>
          <strong>Preference:</strong> remember your locale, currency display,
          and cookie consent decision.
        </li>
        <li>
          <strong>Analytics:</strong> set only with consent &mdash; used to
          measure traffic and improve the site (Google Analytics 4, Hotjar).
        </li>
        <li>
          <strong>Marketing:</strong> set only with consent &mdash; used to
          measure the effectiveness of paid campaigns (Meta Pixel, Pinterest
          Tag).
        </li>
      </ul>
      <p>
        You can adjust cookie preferences at any time via the “Cookie
        preferences” link in the website footer. Disabling analytics or
        marketing cookies will not impact your ability to make a booking.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep personal information only as long as necessary to fulfil the
        purpose for which it was collected and to comply with our legal
        obligations. As a guide:
      </p>
      <ul>
        <li>booking records: 10 years (French Polynesia commercial code);</li>
        <li>marketing email subscriber data: until you unsubscribe, plus 30 days;</li>
        <li>analytics data: 14 months at most (Google Analytics 4 default);</li>
        <li>customer service correspondence: 3 years from the last contact.</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>Depending on where you live, you may have the following rights:</p>

      <h3>6.1 Right to know and access</h3>
      <p>
        You may ask us to confirm whether we process personal information
        about you and to provide a copy in a portable format.
      </p>

      <h3>6.2 Right to correction</h3>
      <p>
        You may ask us to correct inaccurate or incomplete information we
        hold about you.
      </p>

      <h3>6.3 Right to deletion</h3>
      <p>
        You may ask us to delete personal information, subject to legal
        retention requirements (e.g., tax records).
      </p>

      <h3>6.4 California-specific rights (CCPA / CPRA)</h3>
      <p>
        California residents have additional rights, including the right to
        opt out of the “sale” or “sharing” of personal information for
        cross-context behavioral advertising, the right to limit the use of
        sensitive personal information, and the right to non-discrimination
        for exercising any of these rights. You may exercise these rights
        through the “Do Not Sell or Share My Personal Information” link in
        the website footer, or by emailing the address in Section 9.
      </p>

      <h3>6.5 Authorized agents</h3>
      <p>
        You may designate an authorized agent to submit a request on your
        behalf. We will require written verification of the agent&apos;s
        authority and may contact you to confirm the request.
      </p>

      <h2>7. Children&apos;s privacy</h2>
      <p>
        Our website is not directed to children under 13 years of age, and we
        do not knowingly collect personal information from children under 13
        in compliance with the Children&apos;s Online Privacy Protection Act
        (COPPA). If you believe a child has provided us with personal
        information, please contact us at the address in Section 9 and we
        will delete it promptly.
      </p>

      <h2>8. International data transfers</h2>
      <p>
        Villa Paradise Tahiti operates from French Polynesia. Several of our
        service providers are located in the United States and the European
        Union. By using our website or booking a stay, you understand that
        your personal information will be processed in jurisdictions outside
        your country of residence. Where required, we rely on Standard
        Contractual Clauses (SCCs) or equivalent transfer mechanisms to
        provide an adequate level of protection.
      </p>

      <h2>9. How to contact us</h2>
      <p>
        For any privacy-related question or to exercise the rights described
        above, please write to:
      </p>
      <p>
        <strong>Villa Paradise Tahiti &mdash; Privacy</strong>
        <br />
        Email:{' '}
        <a href="mailto:villaparadisetahiti@gmail.com">
          villaparadisetahiti@gmail.com
        </a>
        <br />
        Postal: Punaauia, Tahiti, French Polynesia
      </p>
      <p>
        We will respond within 45 calendar days of receiving a verifiable
        request, as required by the CCPA. Complex requests may be extended
        by an additional 45 days with notice.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect
        changes in our practices, technology, or legal requirements. The
        revised version will indicate a new “Last updated” date at the top
        of the page; material changes will be flagged with a notice on the
        homepage for at least 30 days.
      </p>
    </>
  )
}
