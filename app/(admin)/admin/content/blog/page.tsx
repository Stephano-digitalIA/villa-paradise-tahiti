import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Blog — Admin' }
export const dynamic = 'force-dynamic'

function isPublished(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  return new Date(publishedAt) <= new Date()
}

function formatDate(str: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const { data } = await adminClient
    .from('posts')
    .select('id, slug, title, excerpt, published_at, tags, created_at')
    .order('created_at', { ascending: false })

  const posts = data ?? []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Blog</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">{posts.length} articles</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/content/blog/new">+ New Post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">No posts yet.</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">Click + to create your first one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pearl-400 bg-pearl-300/40">
                  {['Titre', 'Tags', 'Statut', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post, idx) => (
                  <tr
                    key={post.id}
                    className={idx < posts.length - 1 ? 'border-b border-pearl-400' : ''}
                  >
                    <td className="max-w-[300px] px-5 py-4">
                      <p className="font-sans text-sm font-medium text-midnight line-clamp-1">
                        {post.title}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-midnight-400 line-clamp-1">
                        {post.excerpt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags ?? []).slice(0, 3).map((tag: string) => (
                          <Badge key={tag} size="sm" variant="info">
                            {tag}
                          </Badge>
                        ))}
                        {(post.tags ?? []).length > 3 && (
                          <Badge size="sm">+{(post.tags ?? []).length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={isPublished(post.published_at) ? 'success' : 'warning'}
                        size="sm"
                      >
                        {isPublished(post.published_at) ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-midnight-400">
                      {formatDate(post.published_at ?? post.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/content/blog/${post.id}`}
                        className="font-sans text-xs font-medium text-gold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
