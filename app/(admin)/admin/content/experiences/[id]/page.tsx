import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminClient } from '@/lib/supabase/admin'
import { ExperienceForm } from '../ExperienceForm'

export const metadata: Metadata = { title: 'Edit Experience — Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function EditExperiencePage({ params }: Props) {
  const [{ data: experience }, { data: providers }] = await Promise.all([
    adminClient.from('experiences').select('*').eq('id', params.id).single(),
    adminClient.from('excursion_providers').select('id, name').eq('active', true).order('name'),
  ])

  if (!experience) notFound()

  return <ExperienceForm experience={experience} providers={providers ?? []} />
}
