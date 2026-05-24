/**
 * LegalPageHeader — consistent header for the three legal documents.
 *
 * Shows the eyebrow tag, page title, last-updated date, and the
 * pending-counsel disclaimer banner expected on every legal draft until
 * a qualified US attorney signs off.
 */

interface LegalPageHeaderProps {
  eyebrow: string
  title: string
  lastUpdated: string
  /** Short intro paragraph rendered right under the title. */
  intro?: string
}

export function LegalPageHeader({
  eyebrow,
  title,
  lastUpdated,
  intro,
}: LegalPageHeaderProps) {
  return (
    <header className="not-prose mb-10">
      <p className="eyebrow flex items-center gap-3">
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-h1-luxe">
        {title}
      </h1>
      <p className="mt-3 font-sans text-body-sm uppercase tracking-wider2 text-midnight-400">
        Last updated: {lastUpdated}
      </p>
      {intro ? (
        <p className="mt-6 max-w-prose font-sans text-body-md text-midnight-400">
          {intro}
        </p>
      ) : null}

      <div
        role="note"
        className="mt-8 rounded-xl border border-coral/30 bg-coral/5 px-5 py-4"
      >
        <p className="font-sans text-body-sm text-midnight">
          <span className="font-semibold text-coral">Disclaimer.</span> This is a
          template draft pending review by qualified legal counsel licensed in
          the relevant US jurisdiction. Do not rely on it as legal advice. We
          will publish a finalized version reviewed by counsel before launch.
        </p>
      </div>
    </header>
  )
}
