import { defineField, defineType } from 'sanity'

/**
 * FAQ — Frequently Asked Questions.
 *
 * Surfaced on:
 *  - /faq page (grouped by category, sorted by `order`)
 *  - Schema.org FAQPage markup
 *
 * Categories follow the structure in docs/05-contenu-pages.md §8.
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required().min(5).max(200),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Booking & Payment', value: 'booking' },
          { title: 'About the Villa', value: 'villa' },
          { title: 'Tahiti & Travel', value: 'tahiti' },
          { title: 'Payment', value: 'payment' },
          { title: 'Experiences', value: 'experiences' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first within a category.',
      initialValue: 100,
      validation: (rule) => rule.required().integer(),
    }),
  ],
  orderings: [
    {
      title: 'Category, then order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
})
