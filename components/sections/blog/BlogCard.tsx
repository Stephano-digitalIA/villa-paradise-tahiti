import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui'
import { urlForImage, type Post } from '@/lib/sanity'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

interface BlogCardProps {
  post: Post
  /** Larger first-card layout: full-width, two-column on desktop. */
  featured?: boolean
}

/**
 * BlogCard — reusable article preview card.
 *
 * `featured` swaps to a horizontal two-column layout intended for the
 * first/lead post on the index. Default is the vertical grid card.
 */
export function BlogCard({ post, featured = false }: BlogCardProps) {
  const href = `/blog/${post.slug.current}`
  const coverUrl = urlForImage(post.coverImage).width(1600).quality(85).url()
  const dateLabel = formatDate(post.publishedAt)

  if (featured) {
    return (
      <Link
        href={href}
        className="group block overflow-hidden rounded-3xl border border-pearl-400 bg-pearl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="relative aspect-[4/3] lg:col-span-3 lg:aspect-auto">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={post.coverImage.alt ?? post.title}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="h-full w-full bg-pearl-300" aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 lg:col-span-2 lg:p-12">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="luxe" size="sm">
                Featured
              </Badge>
              {post.tags?.slice(0, 2).map((t) => (
                <Badge key={t} variant="default" size="sm">
                  {t}
                </Badge>
              ))}
            </div>

            <h2 className="font-heading text-h2-luxe font-medium leading-tight text-midnight group-hover:text-lagoon">
              {post.title}
            </h2>

            <p className="font-sans text-body-md text-midnight-400">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="font-sans text-body-sm text-midnight-400">
                {post.author?.name ? `By ${post.author.name} · ` : ''}
                {dateLabel}
                {post.readingTimeMin
                  ? ` · ${post.readingTimeMin} min read`
                  : ''}
              </p>
              <span className="inline-flex items-center gap-1.5 text-eyebrow uppercase tracking-widest2 text-gold transition-transform duration-200 group-hover:translate-x-1">
                Read story
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-pearl-400 bg-pearl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-pearl-300" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="default" size="sm">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}

        <h3 className="font-heading text-h3-luxe font-medium leading-snug text-midnight group-hover:text-lagoon">
          {post.title}
        </h3>

        <p className="font-sans text-body-sm leading-relaxed text-midnight-400">
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-pearl-400 pt-4">
          <p className="font-sans text-body-sm text-midnight-400">
            {post.author?.name ?? 'Villa Paradise'}
          </p>
          <p className="font-sans text-body-sm text-midnight-400">
            {dateLabel}
            {post.readingTimeMin ? ` · ${post.readingTimeMin} min` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
