import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Content — Admin' }

const SECTIONS = [
  {
    href: '/admin/content/villa',
    title: 'Villa',
    description: 'Edit name, description, specs, amenities, location and SEO',
  },
  {
    href: '/admin/content/gallery',
    title: 'Gallery',
    description: 'Upload, reorder and categorise villa photos',
  },
  {
    href: '/admin/content/experiences',
    title: 'Experiences',
    description: 'Manage excursions, dining, wellness and cultural activities',
  },
  {
    href: '/admin/content/providers',
    title: 'Providers',
    description: 'Manage excursion and activity partners',
  },
  {
    href: '/admin/content/reviews',
    title: 'Reviews',
    description: 'Add and manage guest reviews from all sources',
  },
  {
    href: '/admin/content/blog',
    title: 'Blog',
    description: 'Write and publish articles about Tahiti and villa life',
  },
  {
    href: '/admin/content/faq',
    title: 'FAQ',
    description: 'Edit frequently asked questions inline, grouped by category',
  },
]

export default function ContentPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-midnight">Content</h1>
      <p className="mt-1 font-sans text-sm text-midnight-400">
        Manage all public content for Villa Paradise Tahiti
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-pearl-400 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card"
          >
            <h2 className="font-heading text-base font-semibold text-midnight transition-colors group-hover:text-gold">
              {s.title}
            </h2>
            <p className="mt-1 font-sans text-sm text-midnight-400">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
