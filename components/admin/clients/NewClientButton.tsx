'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { NewClientDrawer } from './NewClientDrawer'

/**
 * Header CTA for /admin/clients — opens the create-client drawer.
 * On success the drawer redirects to /admin/clients/[id].
 */
export function NewClientButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-midnight px-4 py-2.5 font-sans text-sm font-semibold text-pearl shadow-sm transition-colors hover:bg-midnight/90"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        New client
      </button>
      <NewClientDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
