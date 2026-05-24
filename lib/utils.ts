import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class strings safely.
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (conflict resolution between Tailwind utility classes).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
