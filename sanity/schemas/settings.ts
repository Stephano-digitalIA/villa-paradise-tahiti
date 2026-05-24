import { defineField, defineType } from 'sanity'

/**
 * Settings — Singleton document with site-wide configuration.
 *
 * Holds contact info, social links and pricing defaults used by the
 * booking engine (minimum stay, deposit, default cancellation policy).
 * The owner can tweak these without redeploying.
 */
export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      initialValue: 'Villa Paradise Tahiti',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site description',
      type: 'text',
      rows: 3,
      description: 'Default meta description used for pages without an explicit SEO override.',
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
      description: 'International format (e.g. +689 …).',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Digits only, with country code (e.g. 68987654321).',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'pinterest', title: 'Pinterest', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
      ],
    }),
    defineField({
      name: 'defaultCancellationPolicy',
      title: 'Default cancellation policy',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Fallback cancellation policy shown on /rates and during checkout.',
    }),
    defineField({
      name: 'defaultMinNights',
      title: 'Default minimum nights',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.required().min(1).integer(),
    }),
    defineField({
      name: 'defaultDepositPercent',
      title: 'Default deposit (%)',
      type: 'number',
      initialValue: 30,
      validation: (rule) => rule.required().min(0).max(100),
    }),
    defineField({
      name: 'defaultNightlyRateUSD',
      title: 'Default nightly rate (USD)',
      type: 'number',
      description: 'Public base rate. Seasonal overrides handled separately by the booking engine.',
      initialValue: 690,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'cleaningFeeUSD',
      title: 'Cleaning fee (USD)',
      type: 'number',
      initialValue: 150,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'bookingTermsUrl',
      title: 'Booking terms URL',
      type: 'string',
      description:
        'Internal path (e.g. "/legal/terms") or external URL pointing to the full T&C document.',
    }),
  ],
  preview: {
    select: { title: 'siteName', subtitle: 'contactEmail' },
  },
})
