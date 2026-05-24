'use client'

import { useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface HeroVideoProps {
  videoUrl: string
  posterUrl: string
}

/**
 * Client component — hero background video with sound toggle.
 * Autoplays muted (browser requirement), click the button to unmute.
 */
export function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [ready, setReady] = useState(false)

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
        onCanPlay={() => setReady(true)}
        aria-hidden="true"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

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

      {/* Editorial gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/40 to-midnight/20"
        aria-hidden="true"
      />
    </div>
  )
}
