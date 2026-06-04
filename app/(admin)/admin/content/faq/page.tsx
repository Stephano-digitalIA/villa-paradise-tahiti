import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { FaqClient } from './FaqClient'

export const metadata: Metadata = { title: 'FAQ — Admin' }
// (FAQ is the same word in French — no translation needed for the page title)
export const dynamic = 'force-dynamic'

export default async function FaqPage() {
  const { data } = await adminClient
    .from('faqs')
    .select('*')
    .order('category')
    .order('sort_order', { ascending: true })

  return <FaqClient initialFaqs={data ?? []} />
}
