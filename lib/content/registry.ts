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
