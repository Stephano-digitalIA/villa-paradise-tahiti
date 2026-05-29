'use client'

import { useRef, useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface HeroVideoProps {
  videoUrl: string
  posterUrl: string
}

/**
 * Hero background video — supports HLS (Cloudflare Stream) and plain MP4.
 *
 * HLS playback strategy:
 *  - Safari / iOS : native HLS support via <video src="...m3u8">
 *  - Chrome / Firefox / Edge : hls.js loaded dynamically (no SSR bundle cost)
 *
 * Autoplays muted (browser requirement). Sound toggle in the bottom-right corner.
 */
export function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [ready, setReady] = useState(false)

  const isHLS = videoUrl.endsWith('.m3u8')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!isHLS) {
      // Plain MP4 — browser handles it natively.
      video.src = videoUrl
      return
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari / iOS — native HLS.
      video.src = videoUrl
      return
    }

    // Chrome / Firefox / Edge — load hls.js dynamically.
    let hls: import('hls.js').default | null = null

    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        // Fallback: try setting src directly and hope for the best.
        video.src = videoUrl
        return
      }
      hls = new Hls({
        autoStartLoad: true,
        startLevel: -1, // auto quality
      })
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
    })

    return () => {
      hls?.destroy()
    }
  }, [videoUrl, isHLS])

  function handleReady() {
    setReady(true)
  }

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedMetadata={handleReady}
        onCanPlay={handleReady}
        aria-hidden="true"
      />

      {/* Sound toggle — bottom-right corner */}
      <button
        onClick={toggleSound}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        className="absolute bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-pearl/30 bg-midnight/50 text-pearl backdrop-blur-sm transition hover:bg-midnight/80 hover:border-pearl/60"
      >
        {muted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
