import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StarRatingProps {
  /** Rating between 0 and 5. Non-integer values display a half-star approximation. */
  rating: number
  /** Total number of star icons rendered. Defaults to 5. */
  total?: number
  /** Tailwind size for each star icon (e.g. `h-4 w-4`). */
  size?: string
  /** Optional accessible label override; defaults to e.g. "Rated 4.5 out of 5". */
  ariaLabel?: string
  /** Extra classes for the wrapping span. */
  className?: string
}

/**
 * StarRating — display-only star rating widget.
 *
 * Uses the Lucide `Star` icon for both filled and outlined states (so the
 * shape is identical and only the fill differs — visually cleaner than mixing
 * Star + StarHalf). A half-star is approximated by clipping the filled icon
 * to 50% width.
 *
 * Not interactive. For an editable star input, build a separate component.
 */
export function StarRating({
  rating,
  total = 5,
  size = 'h-4 w-4',
  ariaLabel,
  className,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(total, rating))
  const fullStars = Math.floor(clamped)
  const hasHalf = clamped - fullStars >= 0.25 && clamped - fullStars < 0.75
  const flooredOrCeiled = clamped - fullStars >= 0.75 ? fullStars + 1 : fullStars

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? `Rated ${rating} out of ${total}`}
      className={cn('inline-flex items-center gap-0.5 text-gold', className)}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isFull = i < flooredOrCeiled
        const isHalfHere = !isFull && hasHalf && i === fullStars

        if (isHalfHere) {
          return (
            <span key={i} className={cn('relative inline-block', size)} aria-hidden="true">
              <Star className={cn(size, 'absolute inset-0 fill-none stroke-gold/40')} />
              <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <Star className={cn(size, 'fill-gold stroke-gold')} />
              </span>
            </span>
          )
        }

        return (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              size,
              isFull ? 'fill-gold stroke-gold' : 'fill-none stroke-gold/40',
            )}
          />
        )
      })}
    </span>
  )
}
