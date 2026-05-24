/**
 * Inline structured data block.
 *
 * Renders a `<script type="application/ld+json">` element with safely
 * stringified Schema.org data. Schemas are produced by typed factories
 * in `./schemas.ts`, so the `data` prop is intentionally permissive — the
 * factories enforce shape, this component just serialises.
 *
 * Why `dangerouslySetInnerHTML`:
 *  - JSON-LD must be raw JSON, not text-encoded.
 *  - We control every byte that lands here (schemas come from typed
 *    factories), so the surface stays safe.
 *  - We still escape `</` sequences which would otherwise terminate the
 *    script tag if a string field contains them.
 */

type JsonLdData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>

interface JsonLdProps {
  data: JsonLdData
}

function safeStringify(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- payload is fully controlled JSON
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  )
}
