'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'

import { apiVersion, dataset, projectId, studioBasePath } from './lib/sanity/env'
import { schemaTypes } from './sanity/schemas'

/**
 * Sanity Studio configuration.
 *
 * Embedded at /studio via `app/(studio)/studio/[[...tool]]/page.tsx`.
 *
 * Mock-mode caveat: when `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing or
 * equal to "mock", the embed will load but can't talk to a real backend.
 * Run `npx sanity init` and set the env var to wire it up — see README.
 */

// Singleton document types — only one instance allowed per dataset.
const SINGLETON_TYPES = new Set(['villa', 'settings'])

/**
 * Custom structure builder — collapses singleton document types into a
 * direct-edit list item (rather than a list of one). The user clicks
 * "Villa" and lands straight on the document.
 */
function buildStructure(S: StructureBuilder) {
  return S.list()
    .title('Content')
    .items([
      // Singletons — direct-edit entries.
      S.listItem()
        .title('Villa')
        .id('villa')
        .child(
          S.editor()
            .id('villa')
            .schemaType('villa')
            .documentId('villa'),
        ),
      S.listItem()
        .title('Settings')
        .id('settings')
        .child(
          S.editor()
            .id('settings')
            .schemaType('settings')
            .documentId('settings'),
        ),

      S.divider(),

      // Regular document type lists, excluding singletons.
      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETON_TYPES.has(listItem.getId() ?? ''),
      ),
    ])
}

export default defineConfig({
  name: 'villa-paradise-studio',
  title: 'Villa Paradise Tahiti — Studio',
  projectId,
  dataset,
  basePath: studioBasePath,
  schema: {
    types: schemaTypes,
    // Hide the "New" button for singleton types so the user can't create duplicates.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    // Strip create/delete actions from singletons.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => action !== 'duplicate' && action !== 'unpublish' && action !== 'delete')
        : input,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((option) => !SINGLETON_TYPES.has(option.templateId))
        : prev,
  },
  plugins: [
    structureTool({ structure: buildStructure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
