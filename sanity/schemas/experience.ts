import { defineField, defineType } from 'sanity'

/**
 * Experience — Excursions, catering and on-villa experiences.
 *
 * Consumed by:
 *  - /experiences listing page
 *  - /experiences/[slug] detail page
 *  - Booking engine (Phase D) — added to a stay via the multi-service calculator.
 *
 * Pricing is per person in USD (primary market). Placeholder $150 used during
 * Phase B3 — actual prices set by the owner via Sanity Studio later.
 */
export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Excursion / Daytime', value: 'excursion' },
          { title: 'Evening / Nightlife', value: 'evening' },
          { title: 'Dining & Catering', value: 'dining' },
          { title: 'Wellness', value: 'wellness' },
          { title: 'Cultural', value: 'cultural' },
          { title: 'Adventure', value: 'adventure' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'string',
      description: 'One-line summary shown on listing cards (~120 chars).',
      validation: (rule) => rule.required().min(20).max(160),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Human-readable duration (e.g. "4 hours", "Full day", "2 hours").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceUSD',
      title: 'Price (USD)',
      type: 'number',
      description: 'Per-person price in USD. Use 0 if priced as flat fee (see priceUnit).',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'priceUnit',
      title: 'Price unit',
      type: 'string',
      options: {
        list: [
          { title: 'Per person', value: 'per_person' },
          { title: 'Flat fee', value: 'flat' },
          { title: 'Per group', value: 'per_group' },
        ],
        layout: 'radio',
      },
      initialValue: 'per_person',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'minGuests',
      title: 'Minimum guests',
      type: 'number',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'maxGuests',
      title: 'Maximum guests',
      type: 'number',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'seasonal',
      title: 'Seasonal',
      type: 'boolean',
      description: 'Tick if the experience is only available during a specific window (e.g. whale watching).',
      initialValue: false,
    }),
    defineField({
      name: 'seasonStart',
      title: 'Season start',
      type: 'date',
      hidden: ({ document }) => document?.seasonal !== true,
    }),
    defineField({
      name: 'seasonEnd',
      title: 'Season end',
      type: 'date',
      hidden: ({ document }) => document?.seasonal !== true,
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'reference',
      to: [{ type: 'excursionProvider' }],
      description: 'Local partner delivering the experience. Optional but recommended.',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Short bullet points shown on the detail page (e.g. "Equipment included").',
    }),
    defineField({
      name: 'meetingPoint',
      title: 'Meeting point',
      type: 'string',
      description: 'Where guests start the experience (e.g. "Departs from villa", "Marina Papeete").',
    }),
    defineField({
      name: 'popularity',
      title: 'Popularity score',
      type: 'number',
      description: '0–100 — used to sort experiences (higher first).',
      validation: (rule) => rule.min(0).max(100).integer(),
      initialValue: 50,
    }),
    defineField({
      name: 'featured',
      title: 'Featured on homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Inactive experiences are hidden from the public site and booking flows.',
      initialValue: true,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta title',
          type: 'string',
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(170),
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Popularity (high to low)',
      name: 'popularityDesc',
      by: [{ field: 'popularity', direction: 'desc' }],
    },
    {
      title: 'Price (low to high)',
      name: 'priceAsc',
      by: [{ field: 'priceUSD', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      price: 'priceUSD',
      media: 'coverImage',
      featured: 'featured',
    },
    prepare({ title, subtitle, price, media, featured }) {
      const priceLabel = typeof price === 'number' ? `$${price}` : ''
      const star = featured ? '★ ' : ''
      return {
        title: `${star}${typeof title === 'string' ? title : 'Untitled experience'}`,
        subtitle: [subtitle, priceLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
