import type { Metadata } from 'next'

import { LegalPageHeader } from '@/components/sections/legal'
import { buildMetadata } from '@/lib/seo'

const LAST_UPDATED = 'May 1, 2026'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service — Villa Paradise Tahiti',
  description:
    'The Terms of Service governing your booking, stay, and use of the Villa Paradise Tahiti website.',
  path: '/legal/terms',
})

/**
 * /legal/terms — booking and use Terms of Service draft.
 */
export default function TermsPage() {
  return (
    <>
      <LegalPageHeader
        eyebrow="Terms"
        title="Terms of Service"
        lastUpdated={LAST_UPDATED}
        intro="These Terms of Service govern your access to and use of villaparadisetahiti.com and any booking you make through it. Please read them carefully before reserving your stay."
      />

      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing the Villa Paradise Tahiti website (the &ldquo;Site&rdquo;)
        or completing a reservation, you agree to be bound by these Terms of
        Service (the &ldquo;Terms&rdquo;) and by our{' '}
        <a href="/legal/privacy-policy">Privacy Policy</a> and{' '}
        <a href="/legal/cancellation">Cancellation Policy</a>, which are
        incorporated by reference. If you do not agree, please do not use the
        Site or book a stay.
      </p>

      <h2>2. Booking process</h2>
      <p>
        Reservations are completed online or by direct correspondence with our
        concierge team. To book a stay you must:
      </p>
      <ul>
        <li>
          be at least 18 years of age and legally able to enter into a binding
          contract;
        </li>
        <li>
          provide accurate identity, contact, and payment information for the
          lead guest (the &ldquo;Primary Guest&rdquo;);
        </li>
        <li>
          accept these Terms and the applicable rate, taxes, and fees displayed
          at checkout;
        </li>
        <li>
          pay a non-refundable deposit equal to thirty percent (30%) of the
          total booking value at the time of reservation; the remaining
          seventy percent (70%) is automatically charged sixty (60) days
          before the scheduled arrival date.
        </li>
      </ul>
      <p>
        A reservation is confirmed only when you receive a written confirmation
        from us bearing a unique booking reference. Until then, dates remain
        subject to availability.
      </p>

      <h3>2.1 Currency and pricing</h3>
      <p>
        Rates are displayed in US Dollars (USD). Exchange rates are provided
        for guidance only; you are responsible for any foreign-exchange or
        bank fees imposed by your card issuer.
      </p>

      <h3>2.2 Taxes and fees</h3>
      <p>
        French Polynesia tourism taxes and a one-time cleaning fee are added
        to the nightly rate and are clearly itemized at checkout. We reserve
        the right to pass through any rate increase mandated by the
        government, provided that notice is given before final payment.
      </p>

      <h2>3. Guest responsibilities and house rules</h2>
      <p>The Primary Guest is responsible for the conduct of every member of the party. By booking, you agree that you and your party will:</p>
      <ul>
        <li>
          respect a strict maximum occupancy as confirmed in your reservation;
        </li>
        <li>
          not host parties, weddings, or events of any kind without our
          prior written consent;
        </li>
        <li>
          refrain from smoking inside the villa (designated outdoor areas are
          provided);
        </li>
        <li>
          not bring pets unless a written pet-friendly addendum has been
          signed in advance;
        </li>
        <li>
          observe quiet hours between 10:00 PM and 7:00 AM local time;
        </li>
        <li>
          comply with all applicable French Polynesia laws, including
          environmental and marine-protection regulations.
        </li>
      </ul>
      <p>
        Failure to comply with these rules may result in immediate eviction
        without refund and, where damage or excessive cleaning is incurred,
        in additional charges against the security deposit or credit card on
        file.
      </p>

      <h3>3.1 Damage and security deposit</h3>
      <p>
        A security authorization of up to USD 2,000 is placed on the Primary
        Guest&apos;s credit card 24 hours before arrival. The hold is released
        within seven (7) business days after departure provided the villa is
        left in similar condition to check-in. Any deductions are itemized
        and supported by photos or invoices.
      </p>

      <h2>4. Property use</h2>
      <p>
        The villa is rented for short-term private leisure use only. It may
        not be used for commercial filming, professional photography
        shoots, training sessions, workshops, or any activity that places
        unusual strain on the property without our prior written approval.
        The Primary Guest may not sublet, transfer, or assign the
        reservation in whole or in part.
      </p>

      <h2>5. Check-in, check-out, and access</h2>
      <ul>
        <li>Check-in: 3:00 PM local time, with a personalized welcome by our concierge.</li>
        <li>Check-out: 11:00 AM local time.</li>
        <li>Early or late requests are subject to availability and may incur a half-day charge.</li>
      </ul>
      <p>
        We may require identity documents at check-in to comply with French
        Polynesia hospitality registration rules. The villa and grounds are
        privately monitored; closed-circuit cameras operate only on the
        exterior perimeter and never inside the home.
      </p>

      <h2>6. Cancellation, modification, and refunds</h2>
      <p>
        All cancellations and date changes are governed by our{' '}
        <a href="/legal/cancellation">Cancellation Policy</a>. Please read it
        before booking. Travel insurance is strongly recommended.
      </p>

      <h2>7. Limitations of liability</h2>
      <p>
        To the maximum extent permitted by law, Villa Paradise Tahiti, its
        owners, employees, contractors, and partners shall not be liable for
        any indirect, incidental, consequential, special, or punitive
        damages arising out of or in connection with your booking, stay, or
        use of the Site, even if advised of the possibility of such damages.
        Our aggregate liability for any direct damages shall not exceed the
        total amount actually paid for the relevant reservation.
      </p>
      <p>
        We are not liable for personal injury, loss, or theft of valuables
        arising from negligence of the guest, third parties, or events
        beyond our reasonable control, including ocean and lagoon
        activities undertaken at your own risk. We strongly encourage the
        use of in-room safes and on-water safety briefings.
      </p>

      <h2>8. Force majeure</h2>
      <p>
        Neither party shall be liable for any failure or delay in performing
        its obligations under these Terms when caused by events beyond its
        reasonable control, including natural disasters (cyclones,
        earthquakes, tsunamis), pandemics, government travel bans,
        terrorism, or strikes. In such cases we will issue a full credit for
        the unused portion of your stay, valid for twenty-four (24) months
        and transferable to immediate family.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Villa Paradise Tahiti and
        its representatives from and against any claim, damage, loss,
        liability, cost, or expense (including reasonable attorneys&apos;
        fees) arising out of your breach of these Terms, your negligent or
        wrongful conduct, or your violation of any law or third-party right.
      </p>

      <h2>10. Intellectual property</h2>
      <p>
        All content on the Site &mdash; text, photography, videos, graphics,
        and software &mdash; is owned by or licensed to Villa Paradise
        Tahiti and is protected by international copyright, trademark, and
        other intellectual-property laws. You may not reproduce, distribute,
        or create derivative works without our written permission, except
        for personal, non-commercial preview of your upcoming stay.
      </p>

      <h2>11. Governing law and dispute resolution</h2>
      <p>
        These Terms are governed by the laws of French Polynesia for
        property-related matters and by the laws of the State of Delaware,
        USA, for matters relating to the Site, online bookings, and consumer
        protection, in each case without regard to conflict-of-law
        principles. The parties shall first attempt to resolve any dispute
        in good faith through informal negotiation. If the dispute cannot
        be resolved within thirty (30) days, it shall be submitted to
        binding arbitration administered by JAMS under its Streamlined
        Arbitration Rules, conducted in Wilmington, Delaware, in the
        English language. Nothing in this Section limits either party&apos;s
        right to seek injunctive relief in a court of competent
        jurisdiction.
      </p>

      <h2>12. Modifications to these terms</h2>
      <p>
        We may update these Terms from time to time. The updated version
        will indicate a new &ldquo;Last updated&rdquo; date at the top of
        this page. Material changes affecting your existing reservation
        will be communicated by email at least 30 days before they take
        effect; if you do not accept the change you may cancel the
        impacted reservation for a full refund.
      </p>

      <h2>13. Severability and entire agreement</h2>
      <p>
        If any provision of these Terms is held invalid or unenforceable,
        the remaining provisions shall continue in full force and effect.
        These Terms, together with the Privacy Policy and Cancellation
        Policy, constitute the entire agreement between you and Villa
        Paradise Tahiti regarding the subject matter and supersede all
        prior agreements.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms can be sent to{' '}
        <a href="mailto:legal@villaparadisetahiti.com">
          legal@villaparadisetahiti.com
        </a>{' '}
        or via the <a href="/contact">contact form</a>.
      </p>
    </>
  )
}
