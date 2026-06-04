import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

import { adminClient } from '@/lib/supabase/admin'

import { ExperienceForm } from '../ExperienceForm'

export const metadata: Metadata = { title: 'Nouvelle prestation — Admin' }
export const dynamic = 'force-dynamic'

export default async function NewExperiencePage() {
  const { data: providers } = await adminClient
    .from('excursion_providers')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/content/experiences"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-midnight-400 hover:text-midnight"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Prestations
        </Link>
        <span className="font-sans text-sm text-midnight-400">/</span>
        <span className="font-sans text-sm font-medium text-midnight">
          Nouvelle prestation
        </span>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-pearl-400 bg-pearl-300/40 px-4 py-3">
        <ImageIcon className="mt-0.5 h-4 w-4 flex-none text-gold" aria-hidden="true" />
        <p className="font-sans text-sm text-midnight-400">
          Définis l&apos;image de couverture ci-dessous. La galerie complète
          (photos additionnelles) s&apos;ouvrira sur la page d&apos;édition une
          fois la prestation enregistrée.
        </p>
      </div>

      <ExperienceForm providers={providers ?? []} />
    </div>
  )
}
