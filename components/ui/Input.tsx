import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Affiche l'input en état d'erreur (border coral + focus ring coral). */
  error?: boolean
}

/**
 * Input — champ texte cohérent avec le design system.
 *
 * - Border lagoon/20 par défaut, focus ring gold (compat focus-visible global).
 * - Padding généreux pour confort tactile.
 * - État `error` : bascule sur bordure coral + ring coral au focus.
 *
 * Accepte tous les props natifs `<input>` (type, value, onChange, etc.).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, type = 'text', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        // Base
        'flex h-12 w-full rounded-lg bg-white px-4 py-3 font-sans text-body-md text-midnight',
        'border-2 border-midnight/25',
        'placeholder:text-midnight-300',
        'transition-colors duration-200',
        // Focus
        'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-0',
        // Disabled
        'disabled:cursor-not-allowed disabled:bg-pearl-300 disabled:opacity-60',
        // File input
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-midnight',
        // Error state
        error && 'border-coral focus:border-coral focus:ring-coral/30',
        className
      )}
      {...props}
    />
  )
})
