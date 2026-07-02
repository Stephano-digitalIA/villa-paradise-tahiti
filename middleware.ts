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

  // NOTE: there used to be an "OAuth fallback catcher" here that forwarded any
  // `/?code=<uuid>` on the home page to the admin callback. Both Google logins
  // (admin + customer) now use the *implicit* flow, which returns tokens in the
  // URL fragment (#…) — never a `?code` query on the home page — so the catcher
  // was dead for its intended purpose AND was hijacking customer PKCE fallbacks
  // into the admin flow (dropping guests onto /admin). Removed.

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

  // Protect /admin/* — allow auth pages through, redirect everything else.
  //
  // Note: @supabase/ssr chunks large session cookies into `sb-<ref>-auth-token.0`,
  // `.1`, ... (each ≤4KB). Google OAuth sessions are usually >4KB so they always
  // arrive chunked. The cookie name therefore matches `sb-*-auth-token` with an
  // optional `.<n>` suffix — we use `includes` to cover both the legacy
  // single-cookie format and the chunked one.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/auth')) {
    const hasSession = request.cookies.getAll().some(
      (c) =>
        c.name.startsWith('sb-') &&
        c.name.includes('-auth-token') &&
        !c.name.endsWith('-code-verifier') &&
        c.value.length > 0,
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
