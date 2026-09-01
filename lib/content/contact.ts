/**
 * Editable copy for the /contact page.
 *
 * Same mechanism as the other page registries, with one wrinkle: `ContactForm`
 * is a client component and `getSiteContent()` is server-only. The server page
 * resolves every form string and passes them down as a single `labels` prop,
 * so the client bundle stays free of any content plumbing.
 *
 * Two sentences end in a link (the confirmation message, and the privacy
 * notice under the submit button). Each is split into a text half and a link
 * half rather than dropping the link: the field labels say so, so the operator
 * knows the two parts join up.
 *
 * The email and phone shown in the right-hand panel are NOT here: they come
 * from Réglages (`settings.contactEmail` / `contactPhone`), which stays the one
 * place a contact detail is changed.
 *
 * The type import below is erased at compile time, so this file and
 * `registry.ts` referencing each other creates no runtime cycle.
 */
import type { ContentGroup } from './registry'

export const CONTACT_CONTENT_GROUPS: ContentGroup[] = [
  {
    title: 'Contact : en-tête',
    fields: [
      { key: 'contact.hero.eyebrow', label: 'Sur-titre' },
      { key: 'contact.hero.title', label: 'Titre' },
      { key: 'contact.hero.subtitle', label: 'Sous-titre', multiline: true, rows: 3 },
    ],
  },
  {
    title: 'Contact : introduction du formulaire',
    fields: [
      { key: 'contact.form.eyebrow', label: 'Sur-titre' },
      { key: 'contact.form.title', label: 'Titre' },
      { key: 'contact.form.intro', label: 'Intro', multiline: true, rows: 3 },
    ],
  },
  {
    title: 'Contact : champs du formulaire',
    fields: [
      { key: 'contact.field.name', label: 'Nom complet' },
      { key: 'contact.field.email', label: 'Email' },
      { key: 'contact.field.phone', label: 'Téléphone' },
      { key: 'contact.field.phone_helper', label: 'Téléphone, aide', multiline: true },
      { key: 'contact.field.optional', label: 'Mention « facultatif »' },
      { key: 'contact.field.dates_legend', label: 'Groupe de dates (lecteurs d’écran)' },
      { key: 'contact.field.arrival', label: 'Arrivée' },
      { key: 'contact.field.arrival_aria', label: 'Arrivée, libellé du calendrier' },
      { key: 'contact.field.departure', label: 'Départ' },
      { key: 'contact.field.departure_aria', label: 'Départ, libellé du calendrier' },
      { key: 'contact.field.guests', label: 'Nombre de voyageurs' },
      { key: 'contact.field.message', label: 'Message' },
      { key: 'contact.field.message_helper', label: 'Message, aide', multiline: true },
      { key: 'contact.field.submit', label: 'Bouton d’envoi' },
      { key: 'contact.field.submitting', label: 'Bouton pendant l’envoi' },
      { key: 'contact.field.error', label: 'Message d’erreur', multiline: true },
      {
        key: 'contact.field.privacy_text',
        label: 'Mention vie privée, début (suivi du lien)',
        multiline: true,
      },
      { key: 'contact.field.privacy_link', label: 'Mention vie privée, texte du lien' },
    ],
  },
  {
    title: 'Contact : message de confirmation',
    fields: [
      { key: 'contact.success.title', label: 'Titre' },
      {
        key: 'contact.success.body',
        label: 'Texte, début (suivi du lien)',
        multiline: true,
        rows: 3,
      },
      { key: 'contact.success.link', label: 'Texte du lien vers les prestations' },
      { key: 'contact.success.again', label: 'Bouton « nouvelle demande »' },
    ],
  },
  {
    title: 'Contact : coordonnées (email et téléphone se règlent dans Réglages)',
    fields: [
      { key: 'contact.info.title', label: 'Titre du bloc' },
      { key: 'contact.info.intro', label: 'Intro', multiline: true, rows: 3 },
      { key: 'contact.info.label_email', label: 'Intitulé email' },
      { key: 'contact.info.label_phone', label: 'Intitulé téléphone' },
      { key: 'contact.info.label_response', label: 'Intitulé délai de réponse' },
      { key: 'contact.info.response_value', label: 'Délai de réponse' },
      { key: 'contact.info.response_sub', label: 'Délai de réponse, précision' },
      { key: 'contact.info.label_location', label: 'Intitulé localisation' },
      { key: 'contact.info.location_value', label: 'Localisation' },
    ],
  },
  {
    title: 'Contact : chiffres clés',
    fields: [
      { key: 'contact.stat.s1.value', label: 'Chiffre 1' },
      { key: 'contact.stat.s1.label', label: 'Chiffre 1, intitulé' },
      { key: 'contact.stat.s1.body', label: 'Chiffre 1, texte', multiline: true },
      { key: 'contact.stat.s2.value', label: 'Chiffre 2' },
      { key: 'contact.stat.s2.label', label: 'Chiffre 2, intitulé' },
      { key: 'contact.stat.s2.body', label: 'Chiffre 2, texte', multiline: true },
      { key: 'contact.stat.s3.value', label: 'Chiffre 3' },
      { key: 'contact.stat.s3.label', label: 'Chiffre 3, intitulé' },
      { key: 'contact.stat.s3.body', label: 'Chiffre 3, texte', multiline: true },
    ],
  },
]

/**
 * Published English text per key. MUST mirror the `t(key, 'fallback')`
 * fallbacks in `app/(marketing)/contact/page.tsx` and
 * `components/sections/contact/*`, which is what the public page shows when no
 * override exists.
 */
export const CONTACT_CONTENT_DEFAULTS: Readonly<Record<string, string>> = {
  // En-tête
  'contact.hero.eyebrow': 'Get in Touch',
  'contact.hero.title': "We're Here to Help You Plan",
  'contact.hero.subtitle':
    'Questions, special requests, or ready to book? Our concierge team is on the islands and replies within four hours.',
  // Introduction du formulaire
  'contact.form.eyebrow': 'Inquiry form',
  'contact.form.title': 'Tell us about your trip',
  'contact.form.intro':
    'Share your dates, group size, and anything that would make the stay perfect. The more we know, the better we can tailor it.',
  // Champs du formulaire
  'contact.field.name': 'Full name',
  'contact.field.email': 'Email',
  'contact.field.phone': 'Phone',
  'contact.field.phone_helper': 'So we can reach you faster if needed.',
  'contact.field.optional': 'Optional',
  'contact.field.dates_legend': 'Travel dates',
  'contact.field.arrival': 'Arrival',
  'contact.field.arrival_aria': 'Choose a check-in date',
  'contact.field.departure': 'Departure',
  'contact.field.departure_aria': 'Choose a check-out date',
  'contact.field.guests': 'Number of guests',
  'contact.field.message': 'How can we help?',
  'contact.field.message_helper':
    'Share your travel plans, questions, or special requests (20+ characters).',
  'contact.field.submit': 'Send Inquiry',
  'contact.field.submitting': 'Sending…',
  'contact.field.error': 'Something went wrong. Please try again or email us directly.',
  'contact.field.privacy_text': 'By submitting, you agree to our',
  'contact.field.privacy_link': 'Privacy Policy',
  // Message de confirmation
  'contact.success.title': 'Thank you.',
  'contact.success.body':
    "We'll be in touch within 4 hours (Tahiti time, UTC−10). In the meantime, feel free to explore our",
  'contact.success.link': 'curated experiences',
  'contact.success.again': 'Send another inquiry',
  // Coordonnées
  'contact.info.title': 'Reach us directly',
  'contact.info.intro':
    'Our concierge team is based in Tahiti and replies in English, French, and Polynesian.',
  'contact.info.label_email': 'Email',
  'contact.info.label_phone': 'Phone & WhatsApp',
  'contact.info.label_response': 'Response time',
  'contact.info.response_value': 'We respond within 4 hours',
  'contact.info.response_sub': 'Tahiti time (UTC−10), 7 days a week',
  'contact.info.label_location': 'Location',
  'contact.info.location_value': 'Punaauia, Tahiti, French Polynesia',
  // Chiffres clés
  'contact.stat.s1.value': '4 hours',
  'contact.stat.s1.label': 'Average reply time',
  'contact.stat.s1.body':
    'Real humans, real fast. Our concierge replies within four hours during Tahiti daylight.',
  'contact.stat.s2.value': '98%',
  'contact.stat.s2.label': 'Guest satisfaction',
  'contact.stat.s2.body':
    'Based on 47+ verified post-stay reviews across direct, Airbnb, and Vrbo channels.',
  'contact.stat.s3.value': '100%',
  'contact.stat.s3.label': 'Secure payments',
  'contact.stat.s3.body':
    'PayPal protected. We never store your card details on our servers.',
}

/** Every string `ContactForm` renders, resolved server-side and passed down. */
export interface ContactFormLabels {
  name: string
  email: string
  phone: string
  phoneHelper: string
  optional: string
  datesLegend: string
  arrival: string
  arrivalAria: string
  departure: string
  departureAria: string
  guests: string
  message: string
  messageHelper: string
  submit: string
  submitting: string
  error: string
  privacyText: string
  privacyLink: string
  successTitle: string
  successBody: string
  successLink: string
  successAgain: string
}

/** Fallbacks, so the form still renders if it is ever used without labels. */
export const CONTACT_FORM_LABEL_DEFAULTS: ContactFormLabels = {
  name: CONTACT_CONTENT_DEFAULTS['contact.field.name'],
  email: CONTACT_CONTENT_DEFAULTS['contact.field.email'],
  phone: CONTACT_CONTENT_DEFAULTS['contact.field.phone'],
  phoneHelper: CONTACT_CONTENT_DEFAULTS['contact.field.phone_helper'],
  optional: CONTACT_CONTENT_DEFAULTS['contact.field.optional'],
  datesLegend: CONTACT_CONTENT_DEFAULTS['contact.field.dates_legend'],
  arrival: CONTACT_CONTENT_DEFAULTS['contact.field.arrival'],
  arrivalAria: CONTACT_CONTENT_DEFAULTS['contact.field.arrival_aria'],
  departure: CONTACT_CONTENT_DEFAULTS['contact.field.departure'],
  departureAria: CONTACT_CONTENT_DEFAULTS['contact.field.departure_aria'],
  guests: CONTACT_CONTENT_DEFAULTS['contact.field.guests'],
  message: CONTACT_CONTENT_DEFAULTS['contact.field.message'],
  messageHelper: CONTACT_CONTENT_DEFAULTS['contact.field.message_helper'],
  submit: CONTACT_CONTENT_DEFAULTS['contact.field.submit'],
  submitting: CONTACT_CONTENT_DEFAULTS['contact.field.submitting'],
  error: CONTACT_CONTENT_DEFAULTS['contact.field.error'],
  privacyText: CONTACT_CONTENT_DEFAULTS['contact.field.privacy_text'],
  privacyLink: CONTACT_CONTENT_DEFAULTS['contact.field.privacy_link'],
  successTitle: CONTACT_CONTENT_DEFAULTS['contact.success.title'],
  successBody: CONTACT_CONTENT_DEFAULTS['contact.success.body'],
  successLink: CONTACT_CONTENT_DEFAULTS['contact.success.link'],
  successAgain: CONTACT_CONTENT_DEFAULTS['contact.success.again'],
}
