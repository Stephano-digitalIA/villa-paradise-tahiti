import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Edge middleware — two responsibilities:
 *  1. Refresh the Supabase session cookie on every request (required for SSR auth).
 *  2. Protect /admin/* routes — redirect to /admin/auth if no session found.
 *     Full admin_users table verification happens in the admin layout server component.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  // Refresh session on every request (Supabase SSR requirement)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (keeps auth cookie alive)
  await supabase.auth.getUser()

  // Protect /admin/* — allow auth pages through, redirect everything else
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/auth')) {
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )
    if (!hasSession) {
      const loginUrl = new URL('/admin/auth', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|woff2?)$).*)',
  ],
}
