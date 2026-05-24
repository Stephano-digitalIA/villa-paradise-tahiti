import Image from 'next/image'

import { Container, Section } from '@/components/ui'
import { urlForImage, type PostAuthor } from '@/lib/sanity'

interface BlogAuthorBioProps {
  author: PostAuthor
}

/**
 * BlogAuthorBio — small "about the author" card at the bottom of an article.
 * Renders nothing when the post has no author attached.
 */
export function BlogAuthorBio({ author }: BlogAuthorBioProps) {
  if (!author?.name) return null

  const photoUrl = author.photo
    ? urlForImage(author.photo).width(240).height(240).fit('crop').url()
    : null

  return (
    <Section tone="sand" spacing="tight">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-pearl-400 bg-pearl p-8 text-center shadow-soft sm:flex-row sm:items-start sm:text-left">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gold/30 bg-pearl-300">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={author.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center font-display text-h3-luxe italic text-gold"
              >
                {author.name.slice(0, 1)}
              </span>
            )}
          </div>

          <div>
            <p className="text-eyebrow uppercase tracking-widest2 text-gold">
              About the author
            </p>
            <p className="mt-2 font-heading text-h3-luxe font-medium text-midnight">
              {author.name}
            </p>
            {author.bio ? (
              <p className="mt-2 font-sans text-body-md text-midnight-400">
                {author.bio}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  )
}
