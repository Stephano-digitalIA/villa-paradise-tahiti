import { type ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// FormSection — wrapper for a titled block inside an admin form
// ─────────────────────────────────────────────────────────────────────────────

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={`border-b border-pearl-400 py-8 last:border-b-0 ${className ?? ''}`}>
      <div className="mb-5">
        <h2 className="font-heading text-base font-semibold text-midnight">{title}</h2>
        {description && (
          <p className="mt-1 font-sans text-sm text-midnight-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
