import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
import { PostForm } from '../PostForm'

export const metadata: Metadata = { title: 'Edit Post — Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function EditPostPage({ params }: Props) {
  const { data } = await adminClient
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  return <PostForm post={data} />
}
