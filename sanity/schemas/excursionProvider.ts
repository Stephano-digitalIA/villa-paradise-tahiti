import { defineField, defineType } from 'sanity'

/**
 * ExcursionProvider — Local partner who delivers experiences.
 *
 * Private/back-office reference type. Pricing is stored on the Experience
 * (public-facing), while commission/notes live here for the owner only.
 *
 * Phase B3 prepares the schema; the actual provider directory will be
 * dropped in by the client in a later phase (see docs/assets-client/).
 */
export const excursionProvider = defineType({
  name: 'excursionProvider',
  title: 'Excursion Provider',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Provider name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email().error('Must be a valid email address.'),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
      description: 'International format preferred (e.g. +689 …).',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'commissionPercent',
      title: 'Commission (%)',
      type: 'number',
      description: 'Internal — commission paid back to the villa owner. Never exposed publicly.',
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'notes',
      title: 'Private notes',
      type: 'text',
      rows: 4,
      description: 'Internal notes — booking process, payment terms, etc. Never exposed publicly.',
    }),
    defineField({
      name: 'services',
      title: 'Services offered',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Free-form list of services this provider offers (e.g. "Snorkeling", "Boat charters").',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive providers are hidden from booking flows.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'contactEmail', active: 'active' },
    prepare({ title, subtitle, active }) {
      return {
        title: typeof title === 'string' ? title : 'Untitled provider',
        subtitle: [active ? 'Active' : 'Inactive', subtitle].filter(Boolean).join(' · '),
      }
    },
  },
})
