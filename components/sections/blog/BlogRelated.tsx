import { Container, Section } from '@/components/ui'
import { BlogCard } from './BlogCard'
import type { Post } from '@/lib/sanity'

interface BlogRelatedProps {
  posts: Post[]
}

/**
 * BlogRelated — "Continue reading" block of related posts.
 * Renders nothing when no candidates are passed in.
 */
export function BlogRelated({ posts }: BlogRelatedProps) {
  if (posts.length === 0) return null

  return (
    <Section tone="pearl" spacing="compact">
      <Container>
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">Continue Reading</p>
            <h2 className="font-heading text-h2-luxe font-medium text-midnight">
              You might also enjoy
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
