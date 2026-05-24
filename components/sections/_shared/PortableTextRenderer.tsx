'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

/**
 * Shared Markdown renderer for prose sections.
 *
 * Client component — wraps `react-markdown` with remark-gfm for tables,
 * strikethrough, etc. Accepts Markdown strings from Supabase.
 *
 * Backward-compatible interface: `value` accepts `string | unknown` so
 * existing call-sites that previously passed `PortableTextBlock[]` get a
 * graceful fallback instead of a runtime crash during migration.
 *
 * Usage:
 *   <PortableTextRenderer value={villa.description} />
 */

interface PortableTextRendererProps {
  /** Markdown string (Supabase) or legacy array (fallback). */
  value: string | unknown
  /** Apply the prose container styling (max-w + spacing). Defaults to `true`. */
  prose?: boolean
  className?: string
}

export function PortableTextRenderer({
  value,
  prose = true,
  className,
}: PortableTextRendererProps) {
  // Handle string (new Supabase path)
  if (typeof value === 'string') {
    if (!value.trim()) return null
    return (
      <div className={cn(prose && 'prose prose-lg max-w-none', className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      </div>
    )
  }

  // Handle null/undefined
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null
  }

  // Fallback: render legacy PortableText array as plain text paragraphs
  // (should not occur in production after full Supabase migration)
  if (Array.isArray(value)) {
    return (
      <div className={cn(prose && 'prose prose-lg max-w-none', className)}>
        {value.map((block: unknown, i: number) => {
          const b = block as { children?: { text?: string }[] } | null
          const text = Array.isArray(b?.children)
            ? b!.children.map((c) => c?.text ?? '').join('')
            : String(block)
          return <p key={i}>{text}</p>
        })}
      </div>
    )
  }

  return null
}
