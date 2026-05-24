import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/Header'
import { AdminSidebar } from '@/components/admin/Sidebar'

export const metadata: Metadata = {
  title: 'Admin — Villa Paradise Tahiti',
  robots: { index: false, follow: false },
}

/**
 * Admin dashboard layout — sidebar + header + scrollable content area.
 * Applied to all /admin/* routes except /admin/auth (which is outside this
 * layout tree via the route group structure).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-pearl">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
