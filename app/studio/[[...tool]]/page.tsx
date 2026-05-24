/**
 * Sanity Studio — embedded at `/studio`.
 *
 * Renders the full Studio inside the Next.js app so the villa owner can
 * edit content without leaving the site domain. The catch-all `[[...tool]]`
 * segment lets the Studio router own every sub-path (e.g. /studio/desk,
 * /studio/vision).
 *
 * Mock-mode caveat: when `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing or
 * equal to "mock", we render a lightweight onboarding panel instead of
 * the Studio (which would otherwise crash on a missing projectId).
 */

import type { Metadata } from 'next'
import { NextStudio } from 'next-sanity/studio'

import config from '@/sanity.config'
import { isMockMode } from '@/lib/sanity'

// Studio needs full client-side rendering — disable any static generation.
export const dynamic = 'force-static'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Villa Paradise Studio',
  description: 'Content management for Villa Paradise Tahiti.',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  if (isMockMode) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#0b1320',
          color: '#f5efe6',
        }}
      >
        <div
          style={{
            maxWidth: 560,
            padding: '2.5rem',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c9a44c',
              margin: 0,
              marginBottom: 12,
            }}
          >
            Sanity Studio
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: 0, marginBottom: 12 }}>
            Studio not configured yet
          </h1>
          <p style={{ margin: 0, marginBottom: 16, lineHeight: 1.5, opacity: 0.85 }}>
            The site is currently running on mock data. To activate the Studio:
          </p>
          <ol
            style={{
              margin: 0,
              paddingLeft: 20,
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            <li>
              Run <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>npx sanity init</code> from the project root.
            </li>
            <li>
              Copy the generated <code>projectId</code> into{' '}
              <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code>.env.local</code>.
            </li>
            <li>Restart the dev server. The Studio will load here.</li>
          </ol>
        </div>
      </div>
    )
  }

  return <NextStudio config={config} />
}
