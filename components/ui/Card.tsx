import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  [
    'bg-pearl text-midnight',
    'border border-pearl-400',
    'rounded-2xl',
    'overflow-hidden',
    'transition-all duration-300 ease-luxe',
  ],
  {
    variants: {
      tone: {
        pearl: 'bg-pearl',
        sand: 'bg-sand-100 border-sand-300',
        midnight: 'bg-midnight text-pearl border-midnight-700',
      },
      elevation: {
        flat: 'shadow-none',
        soft: 'shadow-soft',
        card: 'shadow-card',
        elevated: 'shadow-elevated',
      },
      interactive: {
        true: 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'pearl',
      elevation: 'card',
      interactive: false,
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card — conteneur luxe pour chambres, excursions, traiteur, etc.
 *
 * @example
 * <Card interactive>
 *   <CardHeader>
 *     <CardTitle>Ocean Suite</CardTitle>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 *   <CardFooter>...</CardFooter>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone, elevation, interactive, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ tone, elevation, interactive }), className)}
      {...props}
    />
  )
})

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5 p-6 sm:p-8', className)}
        {...props}
      />
    )
  }
)

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn(
          'font-heading text-h3-luxe font-medium leading-tight text-midnight',
          className
        )}
        {...props}
      />
    )
  }
)

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('font-sans text-body-sm text-midnight-400', className)}
        {...props}
      />
    )
  }
)

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-6 pb-6 sm:px-8 sm:pb-8', className)} {...props} />
  }
)

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-3 border-t border-pearl-400 px-6 py-4 sm:px-8',
          className
        )}
        {...props}
      />
    )
  }
)
