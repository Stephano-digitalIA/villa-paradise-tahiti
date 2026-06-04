import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { GalleryClient } from './GalleryClient'

export const metadata: Metadata = { title: 'Galerie — Admin' }
export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const { data } = await adminClient
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })

  return <GalleryClient initialItems={data ?? []} />
}
