import type { Metadata } from 'next'
import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReviewFeaturedToggle } from './ReviewFeaturedToggle'
import type { ReviewSource } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Reviews — Admin' }
export const dynamic = 'force-dynamic'

const SOURCE_VARIANT: Record<ReviewSource, 'default' | 'info' | 'success' | 'warning' | 'luxe' | 'gold'> = {
  direct: 'default',
  airbnb: 'warning',
  vrbo: 'info',
  google: 'info',
  tripadvisor: 'success',
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {'★'.repeat(rating)}
      <span className="text-midnight-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default async function ReviewsPage() {
  const { data } = await adminClient
    .from('reviews')
    .select('*')
    .order('published_at', { ascending: false })

  const reviews = data ?? []

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Reviews</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">{reviews.length} reviews</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/content/reviews/new">+ Add Review</Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-pearl-400 bg-white px-8 py-16 text-center shadow-sm">
          <p className="font-heading text-lg text-midnight-400">No reviews yet.</p>
          <p className="mt-1 font-sans text-sm text-midnight-400">Click + to create your first one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pearl-400 bg-pearl-300/40">
                  {['Author', 'Location', 'Rating', 'Title', 'Source', 'Featured', 'Verified', 'Date', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-midnight-400"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={idx < reviews.length - 1 ? 'border-b border-pearl-400' : ''}
                  >
                    <td className="px-5 py-4 font-sans text-sm font-medium text-midnight">
                      {r.author_name}
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-midnight-400">
                      {r.author_location ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gold">
                      <Stars rating={r.rating} />
                    </td>
                    <td className="max-w-[200px] px-5 py-4 font-sans text-sm text-midnight">
                      <span className="line-clamp-1">{r.title}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={SOURCE_VARIANT[r.source]} size="sm">
                        {r.source}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <ReviewFeaturedToggle id={r.id} featured={r.featured} />
                    </td>
                    <td className="px-5 py-4">
                      {r.verified && (
                        <Badge variant="info" size="sm">
                          Verified
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-midnight-400">
                      {formatDate(r.published_at)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/content/reviews/${r.id}`}
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
