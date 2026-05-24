import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sectionVariants = cva('w-full', {
  variants: {
    tone: {
      pearl: 'bg-pearl text-midnight',
      sand: 'bg-sand text-midnight',
      midnight: 'bg-midnight text-pearl',
      lagoon: 'bg-lagoon text-pearl',
      transparent: 'bg-transparent',
    },
    spacing: {
      default: 'py-16 sm:py-24 lg:py-32',
      compact: 'py-12 sm:py-16 lg:py-20',
      tight: 'py-8 sm:py-12 lg:py-16',
      none: '',
    },
  },
  defaultVariants: {
    tone: 'pearl',
    spacing: 'default',
  },
})

export interface SectionProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

/**
 * Section — wrapper sémantique avec padding vertical et background tonal.
 *
 * Combinable avec <Container> pour gérer la largeur max et le padding horizontal.
 *
 * @example
 * <Section tone="sand">
 *   <Container>...</Container>
 * </Section>
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { className, tone, spacing, children, ...props },
  ref
) {
  return (
    <section ref={ref} className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
      {children}
    </section>
  )
})
