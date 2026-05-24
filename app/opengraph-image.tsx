import { ImageResponse } from 'next/og'

/**
 * Dynamic OpenGraph image — `/opengraph-image`.
 *
 * Rendered on the edge by Next 14's `ImageResponse`. Pure CSS gradient
 * background (no external image fetch) keeps cold-start latency under
 * the strict edge timeout. The same component generates the Twitter card
 * automatically via Next's metadata routing.
 *
 * Design language mirrors the brand identity:
 *  - Midnight `#0F1F2C` → Gold `#C9A84C` diagonal gradient
 *  - Display font sourced from Google Fonts at edge runtime
 *  - Generous negative space, centered eyebrow + wordmark
 */

export const runtime = 'edge'
export const alt = 'Villa Paradise Tahiti — Luxury private villa in French Polynesia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0F1F2C 0%, #1A3247 45%, #5C4720 85%, #C9A84C 100%)',
          color: '#FAFAF8',
          padding: '80px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Top-left brand mark */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          <div style={{ width: 36, height: 1, background: '#C9A84C' }} />
          Villa Paradise
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 24,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div style={{ width: 44, height: 1, background: '#C9A84C' }} />
          <span>French Polynesia · Tahiti</span>
          <div style={{ width: 44, height: 1, background: '#C9A84C' }} />
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 110,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.0,
            textAlign: 'center',
            color: '#FAFAF8',
          }}
        >
          Villa Paradise
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 300,
            lineHeight: 1.0,
            marginTop: 6,
            textAlign: 'center',
            color: '#C9A84C',
          }}
        >
          Tahiti
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 300,
            marginTop: 36,
            maxWidth: 880,
            textAlign: 'center',
            color: 'rgba(250, 250, 248, 0.85)',
            letterSpacing: 0.5,
          }}
        >
          A private luxury villa in the heart of French Polynesia.
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'rgba(250, 250, 248, 0.7)',
          }}
        >
          villaparadisetahiti.com
        </div>
      </div>
    ),
    { ...size },
  )
}
