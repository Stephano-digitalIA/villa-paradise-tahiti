import type { SchemaTypeDefinition } from 'sanity'

import { excursionProvider } from './excursionProvider'
import { experience } from './experience'
import { faq } from './faq'
import { post } from './post'
import { review } from './review'
import { settings } from './settings'
import { villa } from './villa'

/**
 * Sanity schema registry — single source of truth.
 *
 * Order matters for Studio sidebar grouping (singletons first, then content,
 * then back-office references).
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  villa,
  settings,
  // Content
  experience,
  review,
  post,
  faq,
  // Back-office references
  excursionProvider,
]

export {
  excursionProvider,
  experience,
  faq,
  post,
  review,
  settings,
  villa,
}
