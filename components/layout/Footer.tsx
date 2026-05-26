import Link from 'next/link'
import { Facebook, Instagram, MessageCircle, Palmtree } from 'lucide-react'
import { Container } from '@/components/ui'
import { exploreNav, informationNav, legalNav, type NavLink } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/**
 * Footer — Pied de page principal.
 *
 * Server component (pas d'état). L'année du copyright est calculée côté serveur
 * au moment du render — cela suffit pour un site rendu en ISR/SSG. Pour un
 * rebuild quotidien, prévoir une revalidation au moins une fois par jour.
 *
 * Structure : 4 colonnes desktop, empilées sur mobile (pas d'accordéon — le
 * site n'a pas tant de liens, garder simple). Background `midnight` pour un
 * contraste fort de fin de page (rappel hero) + texte clair.
 */

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-midnight text-pearl/80">
      <Container as="div" className="py-16 lg:py-20">
        {/* Grille 4 colonnes desktop / 1 colonne mobile */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Colonne 1 — About */}
          <div className="space-y-4">
            <Link
              href="/"
              aria-label="Villa Paradise Tahiti — Home"
              className="inline-flex items-center gap-2 text-pearl"
            >
              <Palmtree className="h-5 w-5 text-gold" aria-hidden="true" />
              <span className="font-display text-xl italic tracking-wider">
                Villa Paradise
              </span>
            </Link>
            <p className="font-sans text-body-sm leading-relaxed text-pearl/70">
              Your private sanctuary in the heart of French Polynesia. Direct bookings,
              personalized service, and unforgettable experiences — exclusively yours.
            </p>
            <p className="pt-2 font-display text-base italic text-gold">
              &ldquo;Ia ora na&rdquo; — Welcome to Paradise
            </p>
          </div>

          {/* Colonne 2 — Explore */}
          <FooterColumn title="Explore" links={exploreNav} />

          {/* Colonne 3 — Information */}
          <FooterColumn title="Information" links={informationNav} />

          {/* Colonne 4 — Legal */}
          <FooterColumn title="Legal" links={legalNav} />
        </div>

        {/* Séparateur subtil */}
        <div className="mt-12 border-t border-pearl/10 pt-8 lg:mt-16">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-4">
            {/* Copyright + crédits */}
            <div className="text-center sm:text-left">
              <p className="font-sans text-body-sm text-pearl/60">
                &copy; {currentYear} Villa Paradise Tahiti. All rights reserved.
              </p>
              <p className="mt-1 font-sans text-xs text-pearl/40">
                Designed by TahitiTechDigital
              </p>
            </div>

            {/* Icônes sociales */}
            <div className="flex items-center gap-2">
              <SocialLink
                href="#"
                label="Instagram"
                icon={<Instagram className="h-4 w-4" aria-hidden="true" />}
              />
              <SocialLink
                href="#"
                label="Facebook"
                icon={<Facebook className="h-4 w-4" aria-hidden="true" />}
              />
              <SocialLink
                href="https://wa.me/68989210053"
                label="WhatsApp"
                icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}

/* ---------- Sous-composants internes ---------- */

interface FooterColumnProps {
  title: string
  links: readonly NavLink[]
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3
        className={cn(
          'mb-5 font-sans text-eyebrow font-semibold uppercase text-gold'
        )}
      >
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'inline-block font-sans text-body-sm text-pearl/70',
                'transition-colors duration-200 hover:text-gold',
                'focus-visible:outline-none focus-visible:text-gold'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface SocialLinkProps {
  href: string
  label: string
  icon: React.ReactNode
}

function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'border border-pearl/20 text-pearl/70',
        'transition-all duration-200',
        'hover:border-gold hover:text-gold',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-midnight'
      )}
    >
      {icon}
    </a>
  )
}
