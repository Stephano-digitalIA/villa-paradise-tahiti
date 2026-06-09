/**
 * Registry of editable copy blocks — metadata only (key + label + shape).
 * Drives the /admin/content/site editor. Default text stays in the components
 * (as the `t(key, fallback)` fallback), so there is no duplication here.
 *
 * To make a new string editable: wrap it in the component with
 * `t('<key>', '<current text>')` and add the key below.
 */

export interface ContentField {
  key: string
  label: string
  multiline?: boolean
  /** Rows for multiline fields (default 3). */
  rows?: number
}

export interface ContentGroup {
  title: string
  fields: ContentField[]
}

export const SITE_CONTENT_GROUPS: ContentGroup[] = [
  {
    title: 'Accueil — Hero',
    fields: [
      { key: 'home.hero.eyebrow', label: 'Sur-titre' },
      { key: 'home.hero.title1', label: 'Titre — ligne 1 (italique)' },
      { key: 'home.hero.title2', label: 'Titre — ligne 2 (doré)' },
      { key: 'home.hero.subtitle', label: 'Sous-titre', multiline: true },
      { key: 'home.hero.cta_primary', label: 'Bouton principal' },
      { key: 'home.hero.cta_secondary', label: 'Bouton secondaire' },
      { key: 'home.hero.trust_reviews', label: 'Bandeau confiance — avis' },
      { key: 'home.hero.trust_location', label: 'Bandeau confiance — lieu' },
    ],
  },
  {
    title: 'Accueil — Points clés',
    fields: [
      { key: 'home.features.eyebrow', label: 'Sur-titre' },
      { key: 'home.features.title', label: 'Titre de section' },
      { key: 'home.features.f1.title', label: 'Carte 1 — titre' },
      { key: 'home.features.f1.body', label: 'Carte 1 — texte', multiline: true },
      { key: 'home.features.f2.title', label: 'Carte 2 — titre' },
      { key: 'home.features.f2.body', label: 'Carte 2 — texte', multiline: true },
      { key: 'home.features.f3.title', label: 'Carte 3 — titre' },
      { key: 'home.features.f3.body', label: 'Carte 3 — texte', multiline: true },
      { key: 'home.features.f4.title', label: 'Carte 4 — titre' },
      { key: 'home.features.f4.body', label: 'Carte 4 — texte', multiline: true },
    ],
  },
  {
    title: 'Accueil — Réserver en direct',
    fields: [
      { key: 'home.why.eyebrow', label: 'Sur-titre' },
      { key: 'home.why.title', label: 'Titre de section' },
      { key: 'home.why.intro', label: 'Intro', multiline: true },
      { key: 'home.why.w1.title', label: 'Raison 1 — titre' },
      { key: 'home.why.w1.body', label: 'Raison 1 — texte', multiline: true },
      { key: 'home.why.w2.title', label: 'Raison 2 — titre' },
      { key: 'home.why.w2.body', label: 'Raison 2 — texte', multiline: true },
      { key: 'home.why.w3.title', label: 'Raison 3 — titre' },
      { key: 'home.why.w3.body', label: 'Raison 3 — texte', multiline: true },
    ],
  },
  {
    title: 'Accueil — Appel à l’action final',
    fields: [
      { key: 'home.cta.eyebrow', label: 'Sur-titre' },
      { key: 'home.cta.title1', label: 'Titre — ligne 1' },
      { key: 'home.cta.title2', label: 'Titre — ligne 2 (doré)' },
      { key: 'home.cta.subtitle', label: 'Sous-titre', multiline: true },
      { key: 'home.cta.cta_primary', label: 'Bouton principal' },
      { key: 'home.cta.cta_secondary', label: 'Bouton secondaire' },
      { key: 'home.cta.trust_cancel', label: 'Bandeau — annulation' },
      { key: 'home.cta.trust_secure', label: 'Bandeau — paiement' },
    ],
  },
  {
    title: 'Pages légales — markdown (vide = texte par défaut du site)',
    fields: [
      { key: 'legal.terms.body', label: 'Conditions générales (Terms)', multiline: true, rows: 18 },
      { key: 'legal.cancellation.body', label: 'Politique d’annulation', multiline: true, rows: 18 },
      { key: 'legal.privacy.body', label: 'Politique de confidentialité', multiline: true, rows: 18 },
    ],
  },
]

/** Flat list of every valid key — used by the save action to whitelist writes. */
export const SITE_CONTENT_KEYS: ReadonlySet<string> = new Set(
  SITE_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)),
)

/**
 * Current default (published English) text per key — MUST mirror the `t(key,
 * 'fallback')` fallbacks in the home components. Used to pre-fill the admin
 * editor so the operator sees the existing copy instead of blank fields.
 *
 * ⚠️ Keep in sync with the components when a default changes:
 *   - home.hero.*     → components/sections/home/HeroHome.tsx
 *   - home.features.* → components/sections/home/KeyFeatures.tsx
 *   - home.why.*      → components/sections/home/WhyDirectBooking.tsx
 *   - home.cta.*      → components/sections/home/FinalCTA.tsx
 *
 * Legal bodies (legal.*) are intentionally absent: their default is rich JSX
 * (not markdown), so there is nothing to pre-fill — an empty field keeps the
 * built-in legal page.
 */
export const SITE_CONTENT_DEFAULTS: Readonly<Record<string, string>> = {
  // Accueil — Hero
  'home.hero.eyebrow': 'Tahiti · French Polynesia',
  'home.hero.title1': 'Your Private Paradise',
  'home.hero.title2': 'in the Heart of French Polynesia',
  'home.hero.subtitle':
    'A private villa perched on the island’s heights of Tahiti, where the Pacific stretches out at your feet — a heated infinity pool, Moorea on the horizon, and a concierge service curating every detail of your week in paradise.',
  'home.hero.cta_primary': 'Book Now',
  'home.hero.cta_secondary': 'Discover the Villa',
  'home.hero.trust_reviews': '47 Verified Reviews',
  'home.hero.trust_location': 'Punaauia, Tahiti',
  // Accueil — Points clés
  'home.features.eyebrow': 'Why Villa Paradise',
  'home.features.title': 'Four reasons travelers choose us over the resort',
  'home.features.f1.title': 'Private Villa',
  'home.features.f1.body':
    'The entire 4-bedroom,air conditioned property is at your disposal — a completely private retreat, with no overlooking neighbors...',
  'home.features.f2.title': 'Heated Infinity Pool',
  'home.features.f2.body':
    'A infinity pool that blends harmoniously into the lagoon, heated year-round and illuminated at night for evening swims.',
  'home.features.f3.title': 'Moorea on the Horizon',
  'home.features.f3.body':
    'Panoramic views and an unobstructed view of Moorea — the most photographed sunset in Polynesia.',
  'home.features.f4.title': 'Car Included',
  'home.features.f4.body':
    'A private vehicle is made available to you free of charge for the entire duration of your stay so you can explore Tahiti at your own pace.',
  // Accueil — Réserver en direct
  'home.why.eyebrow': 'Booking Direct',
  'home.why.title': 'Why our guests skip the online platforms',
  'home.why.intro':
    'The same villa, the same dates, a better experience for less. Here is what booking directly looks like for our guests.',
  'home.why.w1.title': 'Better Price, Same Villa',
  'home.why.w1.body': 'Pay less by booking directly on our website.',
  'home.why.w2.title': 'Talk to the Owner',
  'home.why.w2.body':
    'No call centres. No anonymous platform messaging. You speak directly with the owner from your first question to the moment you hand back the keys — usually within the hour.',
  'home.why.w3.title': 'A Stay Tailored to You',
  'home.why.w3.body':
    'Welcome basket, private chef night, sunrise snorkel, kid-friendly excursions — every detail of your week is shaped around what your group actually wants to do.',
  // Accueil — Appel à l’action final
  'home.cta.eyebrow': 'Reserve Your Stay',
  'home.cta.title1': 'Ready to start planning',
  'home.cta.title2': 'your Tahiti escape?',
  'home.cta.subtitle':
    'Tell us your dates and the number of travelers — we will hold the villa for 48 hours while you finalize your flights and design the perfect week with our concierge.',
  'home.cta.cta_primary': 'Book Now',
  'home.cta.cta_secondary': 'Message the Owner',
  'home.cta.trust_cancel': '100% refund if cancelled more than 60 days before',
  'home.cta.trust_secure': 'Secure booking by Stripe',
}
