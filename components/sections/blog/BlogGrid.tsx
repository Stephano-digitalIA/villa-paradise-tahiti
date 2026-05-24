import { Container, Section } from '@/components/ui'
import { BlogCard } from './BlogCard'
import type { Post } from '@/lib/sanity'

interface BlogGridProps {
  posts: Post[]
}

/**
 * BlogGrid — full index of journal entries.
 *
 * The first post (most recent) is rendered as a featured horizontal card,
 * the rest fall into a 3-column responsive grid.
 */
export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <Section tone="pearl" spacing="default">
        <Container>
          <p className="text-center font-sans text-body-md text-midnight-400">
            New journal entries are on the way. Check back soon.
          </p>
        </Container>
      </Section>
    )
  }

  const [featured, ...rest] = posts

  return (
    <Section tone="pearl" spacing="default">
      <Container>
        <div className="mb-12">
          <BlogCard post={featured} featured />
        </div>

        {rest.length > 0 ? (
          <>
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 className="font-heading text-h2-luxe font-medium text-midnight">
                More stories
              </h2>
              <p className="font-sans text-body-sm text-midnight-400">
                {rest.length} {rest.length === 1 ? 'article' : 'articles'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </>
        ) : null}
      </Container>
    </Section>
  )
}
