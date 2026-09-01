/**
 * Editable copy for /rates.
 *
 * Same mechanism as the homepage registry: components keep their English text
 * as the `t(key, fallback)` fallback, the operator overrides any key from
 * /admin/content/rates, and both live in the shared `site_content` table.
 *
 * Kept in its own file rather than appended to `registry.ts` because the two
 * feed two separate editor pages, and because `SITE_CONTENT_KEYS` has to be
 * built from both: an import is evaluated before the module body, whereas a
 * `const` declared lower in the same file would not be.
 *
 * The type import below is erased at compile time, so this file and
 * `registry.ts` referencing each other creates no runtime cycle.
 */
import type { ContentGroup } from './registry'

export const RATES_CONTENT_GROUPS: ContentGroup[] = [
  {
    title: 'Tarifs : en-tête',
    fields: [
      { key: 'rates.hero.eyebrow', label: 'Sur-titre' },
      { key: 'rates.hero.title1', label: 'Titre, ligne 1 (italique)' },
      { key: 'rates.hero.title2', label: 'Titre, ligne 2 (doré)' },
      { key: 'rates.hero.subtitle', label: 'Sous-titre', multiline: true, rows: 4 },
    ],
  },
  {
    title: 'Tarifs : grille saisonnière (les prix se règlent dans Réglages)',
    fields: [
      { key: 'rates.grid.eyebrow', label: 'Sur-titre' },
      { key: 'rates.grid.title', label: 'Titre de section' },
      { key: 'rates.grid.intro', label: 'Intro', multiline: true, rows: 3 },
      { key: 'rates.grid.unit', label: 'Unité affichée sous le prix' },
      { key: 'rates.grid.low.name', label: 'Basse saison, nom' },
      { key: 'rates.grid.low.window', label: 'Basse saison, période' },
      { key: 'rates.grid.low.blurb', label: 'Basse saison, texte', multiline: true },
      { key: 'rates.grid.high.name', label: 'Haute saison, nom' },
      { key: 'rates.grid.high.window', label: 'Haute saison, période' },
      { key: 'rates.grid.high.blurb', label: 'Haute saison, texte', multiline: true },
      { key: 'rates.grid.peak.name', label: 'Très haute saison, nom' },
      { key: 'rates.grid.peak.window', label: 'Très haute saison, période' },
      { key: 'rates.grid.peak.blurb', label: 'Très haute saison, texte', multiline: true },
      { key: 'rates.grid.badge_popular', label: 'Pastille haute saison' },
      { key: 'rates.grid.badge_peak', label: 'Pastille très haute saison' },
      { key: 'rates.grid.footnote', label: 'Note de bas de grille', multiline: true },
    ],
  },
  {
    title: 'Tarifs : inclus dans le séjour',
    fields: [
      { key: 'rates.inclusions.eyebrow', label: 'Sur-titre' },
      { key: 'rates.inclusions.title', label: 'Titre de section' },
      { key: 'rates.inclusions.included_title', label: 'Titre de la colonne « inclus »' },
      { key: 'rates.inclusions.i1.title', label: 'Inclus 1, titre' },
      { key: 'rates.inclusions.i1.body', label: 'Inclus 1, texte', multiline: true },
      { key: 'rates.inclusions.i2.title', label: 'Inclus 2, titre' },
      { key: 'rates.inclusions.i2.body', label: 'Inclus 2, texte', multiline: true },
      { key: 'rates.inclusions.i3.title', label: 'Inclus 3, titre' },
      { key: 'rates.inclusions.i3.body', label: 'Inclus 3, texte', multiline: true },
      { key: 'rates.inclusions.i4.title', label: 'Inclus 4, titre' },
      { key: 'rates.inclusions.i4.body', label: 'Inclus 4, texte', multiline: true },
      { key: 'rates.inclusions.i5.title', label: 'Inclus 5, titre' },
      { key: 'rates.inclusions.i5.body', label: 'Inclus 5, texte', multiline: true },
      { key: 'rates.inclusions.i6.title', label: 'Inclus 6, titre' },
      { key: 'rates.inclusions.i6.body', label: 'Inclus 6, texte', multiline: true },
    ],
  },
  {
    title: 'Tarifs : options payantes',
    fields: [
      { key: 'rates.inclusions.extras_title', label: 'Titre de la colonne « options »' },
      { key: 'rates.inclusions.e1.title', label: 'Option 1, titre' },
      { key: 'rates.inclusions.e1.body', label: 'Option 1, texte', multiline: true },
      { key: 'rates.inclusions.e2.title', label: 'Option 2, titre' },
      { key: 'rates.inclusions.e2.body', label: 'Option 2, texte', multiline: true },
      { key: 'rates.inclusions.e3.title', label: 'Option 3, titre' },
      { key: 'rates.inclusions.e3.body', label: 'Option 3, texte', multiline: true },
      { key: 'rates.inclusions.e4.title', label: 'Option 4, titre' },
      { key: 'rates.inclusions.e4.body', label: 'Option 4, texte', multiline: true },
    ],
  },
  {
    title: 'Tarifs : paiement et annulation',
    fields: [
      { key: 'rates.policy.deposit_eyebrow', label: 'Sur-titre paiement' },
      { key: 'rates.policy.deposit_title', label: 'Titre paiement' },
      { key: 'rates.policy.label_deposit', label: 'Libellé acompte' },
      { key: 'rates.policy.label_balance', label: 'Libellé solde' },
      { key: 'rates.policy.value_balance', label: 'Valeur solde' },
      { key: 'rates.policy.label_minstay', label: 'Libellé séjour minimum' },
      { key: 'rates.policy.value_minstay', label: 'Séjour minimum, texte après le nombre' },
      { key: 'rates.policy.label_payment', label: 'Libellé moyens de paiement' },
      { key: 'rates.policy.value_payment', label: 'Valeur moyens de paiement' },
      { key: 'rates.policy.cancel_eyebrow', label: 'Sur-titre annulation' },
      { key: 'rates.policy.cancel_title', label: 'Titre annulation' },
      { key: 'rates.policy.cancel_1_label', label: 'Palier 1, délai' },
      { key: 'rates.policy.cancel_1_body', label: 'Palier 1, conséquence' },
      { key: 'rates.policy.cancel_2_label', label: 'Palier 2, délai' },
      { key: 'rates.policy.cancel_2_body', label: 'Palier 2, conséquence' },
      { key: 'rates.policy.cancel_3_label', label: 'Palier 3, délai' },
      { key: 'rates.policy.cancel_3_body', label: 'Palier 3, conséquence', multiline: true },
    ],
  },
  {
    title: 'Tarifs : appel à l’action final',
    fields: [
      { key: 'rates.cta.eyebrow', label: 'Sur-titre' },
      { key: 'rates.cta.title1', label: 'Titre, ligne 1 (italique)' },
      { key: 'rates.cta.title2', label: 'Titre, ligne 2 (doré)' },
      { key: 'rates.cta.subtitle', label: 'Sous-titre', multiline: true, rows: 3 },
      { key: 'rates.cta.primary', label: 'Bouton principal' },
      { key: 'rates.cta.secondary', label: 'Bouton secondaire' },
      { key: 'rates.cta.trust', label: 'Bandeau de réassurance', multiline: true },
    ],
  },
]

/**
 * Published English text per key. MUST mirror the `t(key, 'fallback')`
 * fallbacks in `components/sections/rates/*`, which is what the public page
 * shows when no override exists.
 *
 * ⚠️ Keep in sync when a default changes:
 *   - rates.hero.*       → components/sections/rates/RatesHero.tsx
 *   - rates.grid.*       → components/sections/rates/RatesGrid.tsx
 *   - rates.inclusions.* → components/sections/rates/RatesInclusions.tsx
 *   - rates.policy.*     → components/sections/rates/RatesPolicy.tsx
 *   - rates.cta.*        → components/sections/rates/RatesCta.tsx
 */
export const RATES_CONTENT_DEFAULTS: Readonly<Record<string, string>> = {
  // En-tête
  'rates.hero.eyebrow': 'Rates & Availability',
  'rates.hero.title1': 'Transparent pricing,',
  'rates.hero.title2': 'year-round magic.',
  'rates.hero.subtitle':
    'One villa, three seasons, zero surprises. The rates below are our published direct rates: always lower than what you will find on Airbnb, VRBO or any aggregator. No service fees, no commissions stacked on top.',
  // Grille saisonnière
  'rates.grid.eyebrow': 'Nightly rates',
  'rates.grid.title': 'Pricing by season',
  'rates.grid.intro':
    'Prices apply to the entire villa (sleeps 8). A 5-night minimum stay applies in low and high season; 7 nights during the peak holiday weeks.',
  'rates.grid.unit': 'per night',
  'rates.grid.low.name': 'Low Season',
  'rates.grid.low.window': 'May – June · October – November',
  'rates.grid.low.blurb':
    'Soft trade winds, fewer travelers and the most generous pricing of the year. Our favorite period.',
  'rates.grid.high.name': 'High Season',
  'rates.grid.high.window': 'July – September · December – early January',
  'rates.grid.high.blurb':
    'Whale-watching season, dry sunny days, golden hour at the pool.',
  'rates.grid.peak.name': 'Peak Holidays',
  'rates.grid.peak.window': 'Christmas week · New Year · Easter',
  'rates.grid.peak.blurb':
    'Villa Paradise Tahiti is the best place to celebrate your Christmas and New Year holidays.',
  'rates.grid.badge_popular': 'Most booked',
  'rates.grid.badge_peak': 'Limited',
  'rates.grid.footnote':
    'Stays of 14+ nights qualify for a 10% extended-stay discount. Mention it when you enquire.',
  // Inclus dans le séjour
  'rates.inclusions.eyebrow': 'What you get',
  'rates.inclusions.title': 'The price includes your well-being and:',
  'rates.inclusions.included_title': 'Included in every stay',
  'rates.inclusions.i1.title': 'Tropical welcome basket',
  'rates.inclusions.i1.body':
    'Fresh papaya, mango, passion fruit, croissants and vanilla coffee awaiting you on the counter upon arrival.',
  'rates.inclusions.i2.title':
    'Daily housekeeping (on request), weekly complimentary for long stays',
  'rates.inclusions.i2.body': 'Linen, towels and kitchen refreshed on your schedule.',
  'rates.inclusions.i3.title': 'Private compact car',
  'rates.inclusions.i3.body':
    'A small island car, five seats, fuel-efficient and parked at the villa, available for the entire duration of your stay.',
  'rates.inclusions.i4.title': 'Free airport transfer',
  'rates.inclusions.i4.body':
    'Complimentary transfer by our taxi partner for the 25-minute journey from Faaʻa International Airport (PPT) or the ferry port.',
  'rates.inclusions.i5.title': 'High-speed Wi-Fi',
  'rates.inclusions.i5.body':
    'Fibre optic available throughout the property, fast enough for video calls from the terrace or remote working.',
  'rates.inclusions.i6.title': 'Snorkelling equipment',
  'rates.inclusions.i6.body': 'Fins, masks and reef-safe sunscreen are available.',
  // Options payantes
  'rates.inclusions.extras_title': 'Optional add-ons',
  'rates.inclusions.e1.title': 'Excursions with our partners',
  'rates.inclusions.e1.body':
    'Snorkelling in the lagoon, 4×4 island tour, catamaran excursion, VIP private boat excursion, sunset cruise, whale watching (in season).',
  'rates.inclusions.e2.title': 'Private chef & catering',
  'rates.inclusions.e2.body':
    'Polynesian-French menus prepared on the terrace by a chef from our concierge network.',
  'rates.inclusions.e3.title': 'In-villa spa services',
  'rates.inclusions.e3.body':
    'Taurumi massage with warm monoï oil, manicure, facial. Book same-day subject to availability.',
  'rates.inclusions.e4.title': 'In-home Thai massage',
  'rates.inclusions.e4.body':
    'Taurumi in-villa massage with warm monoï oil by our certified partner therapist, on request.',
  // Paiement et annulation
  'rates.policy.deposit_eyebrow': 'Deposit & terms',
  'rates.policy.deposit_title': 'How payment works',
  'rates.policy.label_deposit': 'Deposit at booking',
  'rates.policy.label_balance': 'Balance due',
  'rates.policy.value_balance': '30 days before arrival',
  'rates.policy.label_minstay': 'Minimum stay',
  'rates.policy.value_minstay': 'nights (7 in peak)',
  'rates.policy.label_payment': 'Payment methods',
  'rates.policy.value_payment': 'PayPal · Credit and debit cards',
  'rates.policy.cancel_eyebrow': 'Cancellation',
  'rates.policy.cancel_title': 'Flexible, transparent',
  'rates.policy.cancel_1_label': 'More than 60 days before arrival:',
  'rates.policy.cancel_1_body': '100% refund.',
  'rates.policy.cancel_2_label': '30 to 60 days before arrival:',
  'rates.policy.cancel_2_body': '50% refund.',
  'rates.policy.cancel_3_label': 'Within 30 days of arrival:',
  'rates.policy.cancel_3_body':
    'non-refundable. Travel insurance strongly recommended.',
  // Appel à l’action final
  'rates.cta.eyebrow': 'Plan your stay',
  'rates.cta.title1': 'See your total',
  'rates.cta.title2': 'for any dates',
  'rates.cta.subtitle':
    'Pick your check-in, your party size and the experiences you would like. We will show the exact total, in USD, with no hidden fees.',
  'rates.cta.primary': 'Calculate my stay',
  'rates.cta.secondary': 'Ask about availability',
  'rates.cta.trust':
    'Best-rate guarantee · 100% refund if cancelled more than 60 days ahead · Secure payment via PayPal',
}
