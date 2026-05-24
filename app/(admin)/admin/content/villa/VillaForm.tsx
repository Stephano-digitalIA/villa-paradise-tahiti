'use client'

import { useRef, useState, useTransition } from 'react'
import { FormSection } from '@/components/admin/FormSection'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Villa } from '@/lib/supabase/types'
import { updateVilla } from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// VillaForm — "use client" form component, receives villa data as props
// ─────────────────────────────────────────────────────────────────────────────

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string
  label: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        value="true"
        className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
      />
      <span className="font-sans text-sm text-midnight">{label}</span>
    </label>
  )
}

function TagList({ raw }: { raw: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {raw.map((a) => (
        <span
          key={a}
          className="rounded-full border border-pearl-400 bg-pearl-300 px-3 py-1 font-sans text-xs text-midnight"
        >
          {a}
        </span>
      ))}
    </div>
  )
}

type Props = { villa: Villa }

export function VillaForm({ villa }: Props) {
  const [amenitiesPreview, setAmenitiesPreview] = useState<string[]>(villa.amenities ?? [])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleAmenitiesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAmenitiesPreview(e.target.value.split('\n').filter(Boolean))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setStatus('saving')
    startTransition(async () => {
      try {
        await updateVilla(fd)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } catch {
        setStatus('error')
      }
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-midnight">Villa Settings</h1>
          <p className="mt-1 font-sans text-sm text-midnight-400">
            Edit villa details, specs, amenities, and SEO
          </p>
        </div>
        <Button type="submit" form="villa-form" disabled={isPending} size="sm">
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save Changes'}
        </Button>
      </div>

      {status === 'error' && (
        <div className="mb-6 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 font-sans text-sm text-coral">
          Something went wrong. Please try again.
        </div>
      )}

      <form id="villa-form" ref={formRef} onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="px-8">
            <FormSection title="Basic Info">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Villa Name <span className="text-coral">*</span>
                  </label>
                  <Input name="name" defaultValue={villa.name} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Tagline
                  </label>
                  <Input name="tagline" defaultValue={villa.tagline ?? ''} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Description" description="Supports Markdown formatting">
              <MarkdownEditor
                name="description"
                label="Description"
                defaultValue={villa.description}
                rows={8}
              />
            </FormSection>

            <FormSection title="Hero Media">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Hero Image URL
                  </label>
                  <Input name="hero_image_url" defaultValue={villa.hero_image_url ?? ''} placeholder="https://…" />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Hero Image Alt
                  </label>
                  <Input name="hero_image_alt" defaultValue={villa.hero_image_alt ?? ''} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  Hero Video URL
                </label>
                <Input name="hero_video_url" defaultValue={villa.hero_video_url ?? ''} placeholder="https://…" />
              </div>
            </FormSection>

            <FormSection title="Specifications">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { name: 'bedrooms', label: 'Bedrooms', value: villa.bedrooms },
                  { name: 'bathrooms', label: 'Bathrooms', value: villa.bathrooms },
                  { name: 'max_guests', label: 'Max Guests', value: villa.max_guests },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                      {f.label}
                    </label>
                    <Input type="number" name={f.name} defaultValue={f.value} min={1} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Size (sqm)
                  </label>
                  <Input type="number" name="size_sqm" defaultValue={villa.size_sqm ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Size (sqft)
                  </label>
                  <Input type="number" name="size_sqft" defaultValue={villa.size_sqft ?? ''} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <CheckboxField name="has_pool" label="Pool" defaultChecked={villa.has_pool} />
                <CheckboxField name="has_jacuzzi" label="Jacuzzi" defaultChecked={villa.has_jacuzzi} />
                <CheckboxField name="has_ac" label="Air Conditioning" defaultChecked={villa.has_ac} />
                <CheckboxField name="has_wifi" label="WiFi" defaultChecked={villa.has_wifi} />
                <CheckboxField name="has_parking" label="Parking" defaultChecked={villa.has_parking} />
              </div>
            </FormSection>

            <FormSection title="Amenities" description="One amenity per line — displayed as tags">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Amenities list
                  </label>
                  <textarea
                    name="amenities"
                    rows={8}
                    defaultValue={(villa.amenities ?? []).join('\n')}
                    placeholder="Private beach access&#10;Kayaks&#10;Snorkeling equipment"
                    onChange={handleAmenitiesChange}
                    className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <p className="mb-1.5 font-sans text-sm font-medium text-midnight">Preview</p>
                  {amenitiesPreview.length > 0 ? (
                    <TagList raw={amenitiesPreview} />
                  ) : (
                    <p className="font-sans text-sm italic text-midnight-300">No amenities yet.</p>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection title="Location">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">Address</label>
                  <Input name="address" defaultValue={villa.address ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">City <span className="text-coral">*</span></label>
                  <Input name="city" defaultValue={villa.city} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">Country <span className="text-coral">*</span></label>
                  <Input name="country" defaultValue={villa.country} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">Latitude</label>
                  <Input type="number" step="any" name="latitude" defaultValue={villa.latitude ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">Longitude</label>
                  <Input type="number" step="any" name="longitude" defaultValue={villa.longitude ?? ''} />
                </div>
              </div>
            </FormSection>

            <FormSection title="SEO">
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  SEO Title <span className="font-normal text-midnight-400">(max 70 chars)</span>
                </label>
                <Input name="seo_title" defaultValue={villa.seo_title ?? ''} maxLength={70} />
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                  SEO Description <span className="font-normal text-midnight-400">(max 170 chars)</span>
                </label>
                <textarea
                  name="seo_description"
                  rows={3}
                  maxLength={170}
                  defaultValue={villa.seo_description ?? ''}
                  className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}
