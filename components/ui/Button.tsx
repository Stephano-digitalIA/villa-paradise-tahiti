import { forwardRef, type ButtonHTMLAttributes, type ReactElement, cloneElement, isValidElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // Base — typographie & layout
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-bold uppercase',
    'tracking-luxe',
    // Transitions
    'transition-all duration-200 ease-luxe',
    // Focus / disabled
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-pearl',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gold text-midnight',
          'hover:bg-gold-600 hover:-translate-y-0.5',
          'shadow-soft hover:shadow-card',
        ],
        secondary: [
          'bg-lagoon text-pearl',
          'hover:bg-lagoon-600 hover:-translate-y-0.5',
          'shadow-soft hover:shadow-card',
        ],
        outline: [
          'bg-transparent text-midnight',
          'border border-midnight',
          'hover:bg-midnight hover:text-pearl',
        ],
        'outline-light': [
          'bg-transparent text-pearl',
          'border border-pearl/40',
          'hover:border-pearl hover:bg-pearl/10',
        ],
        ghost: [
          'bg-transparent text-midnight',
          'relative',
          'hover:text-gold',
          // Soulignement animé doré
          "after:absolute after:left-4 after:right-4 after:bottom-2 after:h-px after:bg-gold after:scale-x-0 after:origin-left after:transition-transform after:duration-200",
          'hover:after:scale-x-100',
        ],
        link: [
          'bg-transparent text-lagoon',
          'underline-offset-4 hover:underline',
          'normal-case tracking-normal font-medium',
          'p-0 h-auto',
        ],
      },
      size: {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-7 py-3.5',
        lg: 'text-sm px-9 py-4',
        icon: 'h-10 w-10 p-0',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    compoundVariants: [
      // Le variant "link" ignore le padding / rounded
      { variant: 'link', className: 'rounded-none' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, the button merges its props into its single React child element
   * instead of rendering a native `<button>`. Useful for wrapping `<a>` or
   * Next.js `<Link>` while preserving the button styling.
   *
   * @example
   * <Button asChild>
   *   <Link href="/villa">Discover</Link>
   * </Button>
   */
  asChild?: boolean
}

/**
 * Button — variants luxe (primary gold, secondary lagoon, outline, ghost, link).
 *
 * - Respect WCAG : focus visible, contrast AA sur fond pearl/midnight.
 * - `asChild` pour wrapper un `<Link>` Next.js sans markup imbriqué.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, rounded, asChild = false, type, children, ...props },
  ref
) {
  const classes = cn(buttonVariants({ variant, size, rounded }), className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      ...props,
      ref,
    } as Partial<typeof child.props> & { ref: typeof ref })
  }

  return (
    <button ref={ref} type={type ?? 'button'} className={classes} {...props}>
      {children}
    </button>
  )
})

export { buttonVariants }
