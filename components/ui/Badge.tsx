import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'font-sans font-semibold uppercase',
    'tracking-wider2',
    'rounded-full',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'bg-pearl-300 text-midnight border border-pearl-400',
        success: 'bg-leaf/10 text-leaf border border-leaf/20',
        warning: 'bg-coral/10 text-coral border border-coral/20',
        info: 'bg-lagoon/10 text-lagoon border border-lagoon/20',
        luxe: 'bg-midnight text-gold border border-gold/40',
        gold: 'bg-gold text-midnight border border-gold-600',
      },
      size: {
        sm: 'text-[0.65rem] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge — étiquettes courtes pour status (Available, Limited), prix, labels.
 *
 * Variants :
 *  - default : neutre, gris pâle
 *  - success : vert feuille (Available)
 *  - warning : corail (Limited spots)
 *  - info    : lagon (Tags neutres)
 *  - luxe    : or sur fond nuit (Premium, Featured)
 *  - gold    : or plein (CTA décoratif)
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, size, ...props },
  ref
) {
  return (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
})

export { badgeVariants }
