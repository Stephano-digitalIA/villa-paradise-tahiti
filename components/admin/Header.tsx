'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

/** Display label per known URL segment (admin sub-routes). Falls back to a
 *  capitalised segment when not listed so dynamic ids stay readable. */
const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Administration',
  auth: 'Connexion',
  calendar: 'Calendrier',
  callback: 'Callback',
  clients: 'Clients',
  content: 'Contenu',
  blog: 'Blog',
  experiences: 'Prestations',
  faq: 'FAQ',
  gallery: 'Galerie',
  providers: 'Prestataires',
  reviews: 'Avis',
  villa: 'Villa',
  inquiries: 'Demandes',
  new: 'Nouveau',
  reservations: 'Réservations',
  settings: 'Paramètres',
  signout: 'Déconnexion',
}

function labelForSegment(seg: string): string {
  return (
    SEGMENT_LABELS[seg] ??
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
  )
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  let href = ''
  for (const seg of segments) {
    href += `/${seg}`
    crumbs.push({ label: labelForSegment(seg), href })
  }

  return crumbs
}

function Breadcrumb() {
  const pathname = usePathname() ?? '/admin'
  const crumbs = buildBreadcrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 font-sans text-sm">
        {crumbs.map((crumb, idx) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {idx > 0 && (
              <span className="text-midnight-300">
                <ChevronIcon />
              </span>
            )}
            <span
              className={
                idx === crumbs.length - 1
                  ? 'font-medium text-midnight'
                  : 'text-midnight-400'
              }
            >
              {crumb.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function AdminHeader() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName = user?.user_metadata?.full_name as string | undefined
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <header className="flex h-16 items-center justify-between border-b border-pearl-400 bg-pearl px-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* User + Sign Out */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-sand ring-1 ring-pearl-400">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName ?? 'Admin avatar'}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-sans text-xs font-bold text-midnight">
              {initials}
            </span>
          )}
        </div>

        {/* Name */}
        {fullName && (
          <span className="hidden font-sans text-sm text-midnight-600 sm:block">
            {fullName}
          </span>
        )}

        {/* Sign Out */}
        <form action="/admin/auth/signout" method="POST">
          <button
            type="submit"
            className="rounded-lg border border-pearl-400 px-3 py-1.5 font-sans text-xs font-medium text-midnight-600 transition-colors hover:border-midnight hover:text-midnight"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  )
}
