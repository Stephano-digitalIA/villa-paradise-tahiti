'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarCheck, ChevronDown, LogOut, UserCircle } from 'lucide-react'

import { useAuth, getDisplayName } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  /** Variant: light = on transparent dark header, default = on opaque header. */
  variant?: 'default' | 'light'
  className?: string
}

/**
 * UserMenu — signed-in pill in the header.
 *
 * Trigger: avatar bubble + first name + chevron.
 * Panel: "My account" link, "Sign out" button.
 * Closes on Escape, outside click, and after a menu item is activated.
 */
export function UserMenu({ variant = 'default', className }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    function handleMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!user) return null

  const displayName = getDisplayName(user)
  const initial = (displayName[0] ?? '?').toUpperCase()
  const isLight = variant === 'light'

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    router.refresh()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          isLight
            ? 'text-pearl hover:bg-pearl/10 focus-visible:ring-offset-midnight'
            : 'text-midnight hover:bg-sand focus-visible:ring-offset-pearl',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
            'bg-gold text-midnight',
          )}
        >
          {initial}
        </span>
        <span className="font-sans text-sm font-medium max-w-[8rem] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-60 origin-top-right',
            'rounded-xl border border-pearl-400 bg-pearl shadow-elevated',
            'overflow-hidden',
          )}
        >
          <div className="border-b border-pearl-400 px-4 py-3">
            <p className="text-eyebrow font-medium uppercase tracking-widest2 text-midnight-400">
              Signed in as
            </p>
            <p className="mt-0.5 truncate font-sans text-body-sm font-semibold text-midnight">
              {displayName}
            </p>
            {user.email ? (
              <p className="truncate font-sans text-xs text-midnight-400">
                {user.email}
              </p>
            ) : null}
          </div>

          <ul className="flex flex-col py-1.5">
            <li>
              <Link
                role="menuitem"
                href="/account"
                onClick={close}
                className="flex items-center gap-3 px-4 py-2.5 font-sans text-body-sm text-midnight transition-colors hover:bg-sand"
              >
                <UserCircle className="h-4 w-4 text-gold" aria-hidden="true" />
                My account
              </Link>
            </li>
            <li>
              <Link
                role="menuitem"
                href="/account#bookings"
                onClick={close}
                className="flex items-center gap-3 px-4 py-2.5 font-sans text-body-sm text-midnight transition-colors hover:bg-sand"
              >
                <CalendarCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                My bookings
              </Link>
            </li>
          </ul>

          <div className="border-t border-pearl-400 py-1.5">
            <button
              role="menuitem"
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-sans text-body-sm text-midnight transition-colors hover:bg-sand"
            >
              <LogOut className="h-4 w-4 text-coral" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
