import { ImageResponse } from 'next/og'

/**
 * `/villa/opengraph-image` — dedicated OG card for The Villa page.
 *
 * Same edge-rendered ImageResponse approach as the homepage card, but with
 * a tighter focus on the villa product page (4-bedroom, infinity pool).
 */

export const runtime = 'edge'
export const alt = 'The Villa — Villa Paradise Tahiti'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function VillaOpenGraphImage() {
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
            'linear-gradient(160deg, #0F1F2C 0%, #21384D 50%, #C9A84C 100%)',
          color: '#FAFAF8',
          padding: '80px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
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
          Villa Paradise Tahiti
        </div>

        <div
          style={{
            fontSize: 24,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 24,
          }}
        >
          The Villa
        </div>

        <div
          style={{
            fontSize: 92,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.05,
            textAlign: 'center',
            color: '#FAFAF8',
          }}
        >
          Four bedrooms.
        </div>
        <div
          style={{
            fontSize: 92,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.05,
            textAlign: 'center',
            color: '#FAFAF8',
          }}
        >
          One infinity pool.
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 300,
            lineHeight: 1.05,
            marginTop: 12,
            textAlign: 'center',
            color: '#C9A84C',
          }}
        >
          The whole lagoon.
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 300,
            marginTop: 36,
            maxWidth: 880,
            textAlign: 'center',
            color: 'rgba(250, 250, 248, 0.85)',
            letterSpacing: 0.5,
          }}
        >
          Punaauia, Tahiti — your private oceanfront retreat.
        </div>

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
          villaparadisetahiti.com / villa
        </div>
      </div>
    ),
    { ...size },
  )
}
