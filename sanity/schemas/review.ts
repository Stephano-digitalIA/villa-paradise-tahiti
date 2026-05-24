import { defineField, defineType } from 'sanity'

/**
 * Review — Guest testimonial.
 *
 * Surfaced on:
 *  - Homepage carousel (where `featured` is true, latest first)
 *  - /reviews dedicated page (all, sorted by publishedAt desc)
 *
 * Sources include direct testimonials and verified mentions on Airbnb,
 * VRBO and Google. The `source` field powers the small "Verified via …"
 * badge under each review.
 */
export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      description: 'Public-facing name (e.g. "Sarah & Michael K.").',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'authorLocation',
      title: 'Author location',
      type: 'string',
      description: 'City + state/country (e.g. "Seattle, WA").',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'authorPhoto',
      title: 'Author photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional headshot or couple photo.',
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'title',
      title: 'Review title',
      type: 'string',
      description: 'Short headline (e.g. "An unforgettable honeymoon").',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Review body',
      type: 'text',
      rows: 6,
      description: 'Main review text (~200 words max).',
      validation: (rule) => rule.required().min(20).max(2000),
    }),
    defineField({
      name: 'stayDates',
      title: 'Stay dates',
      type: 'object',
      fields: [
        defineField({
          name: 'from',
          title: 'Check-in',
          type: 'date',
        }),
        defineField({
          name: 'to',
          title: 'Check-out',
          type: 'date',
        }),
      ],
    }),
    defineField({
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      description: 'Tick if the stay is verified via a third-party platform (Airbnb, VRBO, Google).',
      initialValue: false,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Direct', value: 'direct' },
          { title: 'Airbnb', value: 'airbnb' },
          { title: 'VRBO', value: 'vrbo' },
          { title: 'Google', value: 'google' },
          { title: 'TripAdvisor', value: 'tripadvisor' },
        ],
        layout: 'radio',
      },
      initialValue: 'direct',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured on homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Highest rated',
      name: 'ratingDesc',
      by: [{ field: 'rating', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'authorName',
      rating: 'rating',
      media: 'authorPhoto',
    },
    prepare({ title, subtitle, rating }) {
      const stars = typeof rating === 'number' ? '★'.repeat(Math.max(0, Math.min(5, rating))) : ''
      return {
        title: typeof title === 'string' ? title : 'Untitled review',
        subtitle: [stars, subtitle].filter(Boolean).join(' · '),
      }
    },
  },
})
