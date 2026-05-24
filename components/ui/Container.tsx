import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Render the container as a different HTML element.
   * Defaults to `div`. Use `section`, `article`, `header`, etc. when semantic.
   */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'aside'
}

/**
 * Container — wrapper max-width centré avec padding horizontal responsive.
 *
 * Convention : max-w-7xl (80rem = 1280px) en alignement avec docs/02 §8.
 * Padding : 16px (mobile) / 24px (sm) / 32px (lg).
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { as: Tag = 'div', className, children, ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </Tag>
  )
})
