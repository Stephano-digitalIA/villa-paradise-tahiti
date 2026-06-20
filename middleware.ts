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

  // OAuth fallback catcher.
  // When Supabase can't honour the requested redirect URL (the admin callback
  // path isn't in the project's Redirect URLs allow-list), it falls back to the
  // configured Site URL — the home page — with the `?code=` attached. Forward
  // that code to the admin callback so Google sign-in still completes, without
  // depending on the Supabase dashboard config. The code is a Supabase OAuth
  // UUID, so we gate on that shape to avoid catching unrelated `?code=` params.
  const oauthCode = request.nextUrl.searchParams.get('code')
  if (
    pathname === '/' &&
    oauthCode &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oauthCode)
  ) {
    const callbackUrl = new URL('/admin/auth/callback', request.url)
    callbackUrl.search = request.nextUrl.search // preserve ?code=… (+ any extras)
    return NextResponse.redirect(callbackUrl)
  }

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
