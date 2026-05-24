import { Container, Section } from '@/components/ui'
import { PortableTextRenderer } from '@/components/sections/_shared/PortableTextRenderer'
import type { Post } from '@/lib/sanity'

interface BlogArticleBodyProps {
  post: Post
}

/**
 * BlogArticleBody — single-column prose body for a blog post.
 *
 * Constrained to a comfortable reading measure (~65ch) and rendered
 * via the shared PortableTextRenderer for consistent typography.
 */
export function BlogArticleBody({ post }: BlogArticleBodyProps) {
  return (
    <Section tone="pearl" spacing="compact">
      <Container>
        <article className="mx-auto max-w-prose">
          <PortableTextRenderer value={post.body} prose={false} />
        </article>
      </Container>
    </Section>
  )
}
