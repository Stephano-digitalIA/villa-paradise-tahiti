'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─────────────────────────────────────────────────────────────────────────────
// MarkdownEditor — textarea + ReactMarkdown preview side by side
// ─────────────────────────────────────────────────────────────────────────────

type MarkdownEditorProps = {
  name: string
  label?: string
  defaultValue?: string | null
  rows?: number
  required?: boolean
  placeholder?: string
}

export function MarkdownEditor({
  name,
  label = 'Content',
  defaultValue,
  rows = 12,
  required,
  placeholder = 'Write in Markdown…',
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-sans text-sm font-medium text-midnight">
          {label}
          {required && <span className="ml-1 text-coral">*</span>}
        </label>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 rounded-lg border border-pearl-400 bg-pearl-300 p-0.5 w-fit">
        {(['write', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`rounded-md px-3 py-1 font-sans text-xs font-medium capitalize transition-colors ${
              mode === tab
                ? 'bg-white text-midnight shadow-sm'
                : 'text-midnight-400 hover:text-midnight'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Editor */}
      {mode === 'write' ? (
        <textarea
          name={name}
          value={value}
          required={required}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-mono text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      ) : (
        <>
          {/* Hidden textarea to submit value in preview mode */}
          <textarea name={name} value={value} readOnly required={required} className="sr-only" />
          <div
            className="prose prose-sm prose-midnight max-w-none min-h-[200px] rounded-lg border border-lagoon/20 bg-white px-4 py-3"
            style={{ minHeight: `${rows * 1.6}rem` }}
          >
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="font-sans text-sm italic text-midnight-300">Nothing to preview yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
