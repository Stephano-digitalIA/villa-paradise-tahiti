'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormSection } from '@/components/admin/FormSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ExcursionProvider } from '@/lib/supabase/types'
import { createProvider, updateProvider } from './actions'

type Props = { provider?: ExcursionProvider | null }

export function ProviderForm({ provider }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(provider)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try {
        if (provider) {
          await updateProvider(provider.id, fd)
        } else {
          await createProvider(fd)
        }
        router.push('/admin/content/providers')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-midnight">
          {isEdit ? 'Edit Provider' : 'New Provider'}
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/content/providers')}>
            Cancel
          </Button>
          <Button type="submit" form="provider-form" disabled={isPending} size="sm">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Provider'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 font-sans text-sm text-coral">
          {error}
        </div>
      )}

      <form id="provider-form" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-pearl-400 bg-white shadow-sm">
          <div className="px-8">
            <FormSection title="Contact Info">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Name <span className="text-coral">*</span>
                  </label>
                  <Input name="name" defaultValue={provider?.name} required />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Email
                  </label>
                  <Input type="email" name="contact_email" defaultValue={provider?.contact_email ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Phone
                  </label>
                  <Input type="tel" name="contact_phone" defaultValue={provider?.contact_phone ?? ''} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Website
                  </label>
                  <Input type="url" name="website" defaultValue={provider?.website ?? ''} placeholder="https://…" />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Instagram
                  </label>
                  <Input name="instagram" defaultValue={provider?.instagram ?? ''} placeholder="@handle" />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-medium text-midnight">
                    Commission (%)
                  </label>
                  <Input
                    type="number"
                    name="commission_percent"
                    defaultValue={provider?.commission_percent ?? ''}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Services" description="One service per line">
              <textarea
                name="services"
                rows={5}
                defaultValue={(provider?.services ?? []).join('\n')}
                placeholder="Lagoon excursion&#10;Shark & ray feeding&#10;Private boat charter"
                className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </FormSection>

            <FormSection title="Notes">
              <textarea
                name="notes"
                rows={4}
                defaultValue={provider?.notes ?? ''}
                placeholder="Internal notes about this provider…"
                className="w-full resize-y rounded-lg border border-lagoon/20 bg-pearl px-4 py-3 font-sans text-sm text-midnight placeholder:text-midnight-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </FormSection>

            <FormSection title="Status">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  value="true"
                  defaultChecked={provider?.active ?? true}
                  className="h-4 w-4 rounded border-pearl-400 text-gold focus:ring-gold"
                />
                <span className="font-sans text-sm text-midnight">Active</span>
              </label>
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  )
}
