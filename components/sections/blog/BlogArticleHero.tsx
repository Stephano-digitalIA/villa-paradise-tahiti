import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Badge, Container } from '@/components/ui'
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

interface BlogArticleHeroProps {
  post: Post
}

/**
 * BlogArticleHero — full-width image hero for a blog post.
 * Eyebrow row holds the back-to-journal link and tag badges.
 */
export function BlogArticleHero({ post }: BlogArticleHeroProps) {
  const coverUrl = urlForImage(post.coverImage).width(2400).quality(85).url()

  return (
    <section className="relative isolate">
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-midnight">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.coverImage.alt ?? post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-hero-overlay" aria-hidden="true" />
      </div>

      <Container className="-mt-32 pb-12">
        <div className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-pearl-400 bg-pearl p-8 shadow-elevated sm:p-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-eyebrow uppercase tracking-widest2 text-midnight-400 hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to journal
          </Link>

          {post.tags && post.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="default" size="sm">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}

          <h1 className="mt-6 font-display text-hero-sm font-light italic leading-[1.05] text-midnight sm:text-h1-luxe">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-6 font-sans text-body-lg leading-relaxed text-midnight-400">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-pearl-400 pt-6">
            {post.author?.name ? (
              <p className="font-sans text-body-sm text-midnight">
                By{' '}
                <span className="font-semibold">{post.author.name}</span>
              </p>
            ) : null}
            <p className="font-sans text-body-sm text-midnight-400">
              {formatDate(post.publishedAt)}
            </p>
            {post.readingTimeMin ? (
              <p className="font-sans text-body-sm text-midnight-400">
                {post.readingTimeMin} min read
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  )
}
