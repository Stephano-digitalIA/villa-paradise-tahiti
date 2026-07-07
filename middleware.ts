import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

/**
 * Edge middleware — two responsibilities:
 *  1. Refresh the Supabase session cookie on every request (required for SSR auth).
 *  2. Authorize /admin/* routes — the caller must be a whitelisted `admin_users`
 *     row, not merely hold a Supabase session.
 *
 * Why membership (not just "a session exists") is checked here:
 *   Admin and customer sign-ins share the SAME Supabase auth session (one
 *   project, one `sb-*-auth-token` cookie). A customer who signs in on the
 *   public site (e.g. Google at checkout) therefore holds a perfectly valid
 *   session cookie. Gating on cookie presence alone would let that customer
 *   reach /admin/* — where pages read via the service-role client and bypass
 *   RLS. This middleware is the single server-side choke point that keeps admin
 *   access independent from public-site login. The admin API routes
 *   (/api/admin/*) enforce the same `admin_users` check independently.
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
  const supabase = createServerClient<Database>(
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

  // Refresh session (keeps auth cookie alive) and capture the user so the
  // admin authorization check below doesn't need a second round-trip.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Authorize /admin/* — the auth page itself stays open (else the redirect
  // target below would loop). Everything else requires admin_users membership.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/auth')) {
    // Not signed in at all → send to the admin login.
    if (!user) {
      return NextResponse.redirect(new URL('/admin/auth', request.url))
    }

    // Signed in, but is this user actually an admin? RLS policy
    // `admin_users_self` lets a user read (only) their own row, so a match
    // proves membership without the service-role key (never expose it here).
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      // Authenticated but not an admin — typically a customer who signed in on
      // the public site and then hit an /admin URL. Deny admin access WITHOUT
      // destroying their (shared) customer session: bounce them to the public
      // home page rather than the admin login (which force-signs-out on load).
      return NextResponse.redirect(new URL('/', request.url))
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
