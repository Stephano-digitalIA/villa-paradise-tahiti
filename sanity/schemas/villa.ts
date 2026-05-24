import { defineField, defineType } from 'sanity'

/**
 * Villa — Singleton document describing the property.
 *
 * There should be only one Villa document. Enforcement at the Studio level
 * is handled in `sanity.config.ts` (custom structure) but the schema is
 * intentionally simple here: __id "villa" is the conventional way to lock
 * a singleton without a plugin.
 *
 * All copy is in English — primary US market.
 */
export const villa = defineType({
  name: 'villa',
  title: 'Villa',
  type: 'document',
  // Disable creating multiple instances by hiding the "create new" action via structure.
  // The actual restriction lives in sanity.config.ts (see structure tool).
  fields: [
    defineField({
      name: 'name',
      title: 'Villa name',
      type: 'string',
      description: 'Marketing name of the villa (e.g. "Villa Paradise Tahiti").',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description:
        'Short marketing line under the name (e.g. "Your private paradise in the heart of French Polynesia").',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'description',
      title: 'Long description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text description of the villa (Portable Text).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero video URL',
      type: 'url',
      description:
        'Optional looping hero video (MP4/WebM URL). Falls back to heroImage if missing.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
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
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Exterior', value: 'exterior' },
                  { title: 'Interior', value: 'interior' },
                  { title: 'Pool & Garden', value: 'pool' },
                  { title: 'Lagoon Views', value: 'lagoon' },
                  { title: 'Bedrooms', value: 'bedrooms' },
                  { title: 'Night', value: 'night' },
                ],
                layout: 'radio',
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'object',
      fields: [
        defineField({
          name: 'bedrooms',
          title: 'Bedrooms',
          type: 'number',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        defineField({
          name: 'bathrooms',
          title: 'Bathrooms',
          type: 'number',
          validation: (rule) => rule.required().min(0).precision(1),
        }),
        defineField({
          name: 'maxGuests',
          title: 'Maximum guests',
          type: 'number',
          validation: (rule) => rule.required().min(1).integer(),
        }),
        defineField({
          name: 'sizeSqm',
          title: 'Size (m²)',
          type: 'number',
          description: 'Total living area in square meters.',
        }),
        defineField({
          name: 'sizeSqft',
          title: 'Size (sq ft)',
          type: 'number',
          description: 'Total living area in square feet (US-facing).',
        }),
        defineField({
          name: 'hasPool',
          title: 'Private pool',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'hasJacuzzi',
          title: 'Jacuzzi',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'hasAC',
          title: 'Air conditioning',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'hasWifi',
          title: 'Wi-Fi',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'hasParking',
          title: 'Private parking',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Free-form list of amenities (e.g. "Smart TV", "Kayaks", "Beach access").',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({
          name: 'address',
          title: 'Address',
          type: 'string',
          description: 'Public street address (used in /villa map section).',
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
          initialValue: 'French Polynesia',
        }),
        defineField({
          name: 'lat',
          title: 'Latitude',
          type: 'number',
        }),
        defineField({
          name: 'lng',
          title: 'Longitude',
          type: 'number',
        }),
      ],
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
        defineField({
          name: 'ogImage',
          title: 'Open Graph image',
          type: 'image',
          description: 'Social-sharing image (1200x630 recommended).',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'heroImage' },
  },
})
