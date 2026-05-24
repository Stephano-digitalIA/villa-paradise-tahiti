import type { Metadata } from 'next'

import { CancellationTiers, LegalPageHeader } from '@/components/sections/legal'
import { buildMetadata } from '@/lib/seo'

const LAST_UPDATED = 'May 1, 2026'

export const metadata: Metadata = buildMetadata({
  title: 'Cancellation Policy — Villa Paradise Tahiti',
  description:
    'Refund tiers, force majeure exceptions, and how to modify or cancel your Villa Paradise Tahiti reservation.',
  path: '/legal/cancellation',
})

/**
 * /legal/cancellation — refund tiers, force majeure exceptions, and
 * process for modifying or cancelling a booking.
 */
export default function CancellationPage() {
  return (
    <>
      <LegalPageHeader
        eyebrow="Cancellation"
        title="Cancellation Policy"
        lastUpdated={LAST_UPDATED}
        intro="This policy describes how refunds are calculated when you cancel or modify a confirmed reservation at Villa Paradise Tahiti. Travel insurance is strongly recommended to protect you against the unexpected."
      />

      <h2>1. Policy summary</h2>
      <p>
        Refund amounts depend on how many days before the scheduled arrival
        date we receive your written cancellation request, sent from the
        email address used to book or via the{' '}
        <a href="/contact">contact form</a>. Time is calculated in calendar
        days, in Pacific/Tahiti time (UTC&minus;10).
      </p>

      <CancellationTiers />

      <h2>2. Force majeure exceptions</h2>
      <p>
        If circumstances entirely outside your reasonable control prevent
        you from travelling, we will replace the standard refund tier
        above with a <strong>full credit</strong> for the value of your
        booking, valid for twenty-four (24) months from the original
        arrival date and transferable to immediate family. Examples of
        force majeure events include:
      </p>
      <ul>
        <li>
          natural disasters declared by competent authorities (cyclones,
          earthquakes, tsunamis, volcanic events);
        </li>
        <li>
          official health emergencies and pandemics that restrict travel
          between your country of departure and French Polynesia;
        </li>
        <li>
          government-issued travel bans or border closures targeting your
          country of departure or French Polynesia;
        </li>
        <li>
          civil unrest, war, or terrorism advisories issued by the US
          Department of State or the French Ministère de l&apos;Europe et
          des Affaires étrangères for the destination.
        </li>
      </ul>
      <p>
        Force majeure claims must be supported by an official document
        (governmental advisory, airline cancellation notice, medical
        certificate where lawfully shareable). Individual flight
        cancellations, weather forecasts, work commitments, and personal
        scheduling changes do not qualify as force majeure.
      </p>

      <h2>3. Refund process and timing</h2>
      <p>
        Approved refunds are issued to the original payment method within{' '}
        <strong>fourteen (14) business days</strong> of our confirmation.
        Depending on your bank or card issuer, an additional five to ten
        days may pass before the credit appears on your statement.
      </p>
      <p>Refunds exclude the following non-refundable items, in every tier:</p>
      <ul>
        <li>
          payment-processor fees retained by Stripe or PayPal (typically
          2.9% + USD 0.30 per transaction);
        </li>
        <li>
          third-party experience deposits already disbursed to our
          on-island partners (private chef, charter boat captain,
          helicopter tour, etc.);
        </li>
        <li>
          currency-conversion fees levied by your bank or card network.
        </li>
      </ul>

      <h2>4. Travel insurance recommendation</h2>
      <p>
        We <strong>strongly recommend</strong> that every guest purchase a
        comprehensive travel-insurance policy as soon as the reservation
        is confirmed. A typical policy covers trip cancellation, medical
        emergencies, lost luggage, and travel delays, often for less than
        five percent of the total trip cost.
      </p>
      <p>
        Reputable providers include:
      </p>
      <ul>
        <li>
          <a href="https://www.allianztravelinsurance.com" rel="noopener noreferrer">
            Allianz Travel Insurance
          </a>{' '}
          &mdash; broad coverage, well-known in the United States.
        </li>
        <li>
          <a href="https://www.worldnomads.com" rel="noopener noreferrer">
            World Nomads
          </a>{' '}
          &mdash; flexible policies including water sports and adventure
          activities.
        </li>
        <li>
          <a href="https://www.travelguard.com" rel="noopener noreferrer">
            Travel Guard (AIG)
          </a>{' '}
          &mdash; established US insurer with cancel-for-any-reason
          add-ons.
        </li>
      </ul>
      <p>
        We are not affiliated with these providers and receive no
        commission for the recommendation; coverage terms vary and you
        should review them carefully against your itinerary.
      </p>

      <h2>5. Modifications and date changes</h2>
      <p>
        Date changes are accommodated free of charge subject to villa
        availability and provided that:
      </p>
      <ul>
        <li>
          the request is received at least <strong>thirty (30) days</strong>{' '}
          before the original arrival date;
        </li>
        <li>
          the new dates fall within twelve (12) months of the original
          arrival date;
        </li>
        <li>
          the rates of the new dates are honored at the original booking
          rate when equal or lower, and adjusted to the new rate when
          higher (we will not refund the difference if the new rate is
          lower).
        </li>
      </ul>
      <p>
        Date changes requested less than 30 days before arrival are
        treated as cancellations under Section 1 followed by a new
        reservation at the prevailing rate.
      </p>

      <h2>6. Group reductions</h2>
      <p>
        Reducing the number of guests after booking does not generate a
        refund of the per-night villa rate, as the entire property is
        reserved exclusively for your party. Pre-paid experiences booked
        on a per-person basis are refunded only when the operator&apos;s
        own cancellation policy allows it.
      </p>

      <h2>7. Our right to cancel</h2>
      <p>
        We reserve the right to cancel a reservation if the property
        becomes uninhabitable through no fault of the guest (major
        infrastructure failure, government order, etc.). In such case, we
        will refund the full amount paid or, at your election, offer
        comparable alternative dates and a 10% discount as a goodwill
        gesture. This right will not be invoked for trivial reasons.
      </p>

      <h2>8. How to cancel or change a booking</h2>
      <p>
        Send a written request from the email address used to book to{' '}
        <a href="mailto:reservations@villaparadisetahiti.com">
          reservations@villaparadisetahiti.com
        </a>
        , quoting your booking reference. We will reply within four (4)
        hours during Tahiti business hours and confirm the applicable
        refund or credit calculation before processing.
      </p>
    </>
  )
}
