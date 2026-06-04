import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
import { ProviderForm } from '../ProviderForm'

export const metadata: Metadata = { title: 'Éditer le prestataire — Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function EditProviderPage({ params }: Props) {
  const { data } = await adminClient
    .from('excursion_providers')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  return <ProviderForm provider={data} />
}
