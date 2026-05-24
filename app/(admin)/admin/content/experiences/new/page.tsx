import type { Metadata } from 'next'
import { adminClient } from '@/lib/supabase/admin'
import { ExperienceForm } from '../ExperienceForm'

export const metadata: Metadata = { title: 'New Experience — Admin' }
export const dynamic = 'force-dynamic'

export default async function NewExperiencePage() {
  const { data: providers } = await adminClient
    .from('excursion_providers')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return <ExperienceForm providers={providers ?? []} />
}
