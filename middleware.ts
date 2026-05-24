import { type NextRequest, NextResponse } from 'next/server'

/**
 * Lightweight edge middleware — only protects /admin/* routes.
 * Checks for a Supabase session cookie (sb-*-auth-token).
 * Full admin_users table verification happens in the admin layout server component.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only intercept /admin/* routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow auth pages through
  if (pathname.startsWith('/admin/auth')) return NextResponse.next()

  // Check for any active Supabase session cookie
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    const loginUrl = new URL('/admin/auth', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
