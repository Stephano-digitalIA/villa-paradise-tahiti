import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { adminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/Badge'
import { ExperienceGalleryManager } from '@/components/admin/content/ExperienceGalleryManager'
import type { ExperienceGalleryItem } from '@/lib/supabase/types'

import { ExperienceForm } from '../ExperienceForm'

export const metadata: Metadata = { title: 'Edit Experience — Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function EditExperiencePage({ params }: Props) {
  const [{ data: experience }, { data: providers }, { data: gallery }] =
    await Promise.all([
      adminClient.from('experiences').select('*').eq('id', params.id).single(),
      adminClient
        .from('excursion_providers')
        .select('id, name')
        .eq('active', true)
        .order('name'),
      adminClient
        .from('experience_gallery')
        .select('*')
        .eq('experience_id', params.id)
        .order('sort_order', { ascending: true }),
    ])

  if (!experience) notFound()

  const galleryItems = (gallery ?? []) as ExperienceGalleryItem[]

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* ─── Breadcrumb + actions ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content/experiences"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-midnight-400 hover:text-midnight"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Prestations
          </Link>
          <span className="font-sans text-sm text-midnight-400">/</span>
          <span className="truncate font-sans text-sm font-medium text-midnight">
            {experience.title}
          </span>
          {!experience.active ? (
            <Badge variant="warning" size="sm">
              Draft — hidden publicly
            </Badge>
          ) : null}
        </div>

        <a
          href={`/experiences/${experience.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-pearl-400 bg-white px-3 py-2 font-sans text-sm font-medium text-midnight shadow-sm transition-colors hover:border-midnight"
        >
          <ExternalLink className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          View on site
        </a>
      </div>

      <ExperienceForm experience={experience} providers={providers ?? []} />

      <ExperienceGalleryManager
        experienceId={experience.id}
        experienceSlug={experience.slug}
        initialImages={galleryItems}
      />
    </div>
  )
}
