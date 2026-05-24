import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
import { ReviewForm } from '../ReviewForm'

export const metadata: Metadata = { title: 'Edit Review — Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function EditReviewPage({ params }: Props) {
  const { data } = await adminClient
    .from('reviews')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  return <ReviewForm review={data} />
}
