import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (!code) {
    // No code in the callback — usually Supabase forwarded a provider error
    // (redirect-URL not allow-listed, Google OAuth misconfig, user denied…).
    // Surface whatever params we did receive so the cause is visible.
    const received =
      [
        searchParams.get('error'),
        searchParams.get('error_code'),
        searchParams.get('error_description'),
      ]
        .filter(Boolean)
        .join(' · ') || 'no ?code returned by Supabase'
    // eslint-disable-next-line no-console
    console.error('[admin/auth/callback] no code', { received, search: request.nextUrl.search })
    return NextResponse.redirect(
      `${origin}/admin/auth?error=auth_failed&detail=${encodeURIComponent(`no_code: ${received}`)}`,
    )
  }

  // We collect every cookie Supabase writes during this request so we can
  // attach them to the final 307 ourselves. Relying on next/headers cookies()
  // alone has a known propagation issue with the @supabase/ssr getAll/setAll
  // pattern: cookies set during exchangeCodeForSession sometimes don't reach
  // the Set-Cookie headers of the route handler's redirect response, which
  // makes the next middleware-protected GET appear unauthenticated.
  const collectedCookies: Array<{
    name: string
    value: string
    options: CookieOptions
  }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach((c) => collectedCookies.push(c))
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  let target: string

  if (!error && data.user) {
    // Lookup via service-role client to bypass RLS — the SSR client's
    // session is not yet primed for an RLS-protected SELECT on admin_users
    // within the same request that performed exchangeCodeForSession.
    const { data: adminUser } = await adminClient
      .from('admin_users')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (adminUser) {
      await adminClient
        .from('admin_users')
        .update({
          full_name: data.user.user_metadata?.full_name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        })
        .eq('id', data.user.id)
      target = `${origin}${next}`
    } else {
      await supabase.auth.signOut()
      target = `${origin}/admin/auth?error=unauthorized`
    }
  } else {
    // Exchange failed — surface the exact Supabase error (PKCE verifier missing,
    // invalid/expired code, provider misconfig…).
    const reason = error?.message ?? 'exchange returned no user'
    // eslint-disable-next-line no-console
    console.error('[admin/auth/callback] exchange failed', { reason })
    target = `${origin}/admin/auth?error=auth_failed&detail=${encodeURIComponent(reason)}`
  }

  // Build the redirect with every Set-Cookie we accumulated. This is what
  // primes the browser cookie jar so the next request hits the middleware
  // with a valid session.
  const response = NextResponse.redirect(target)
  for (const { name, value, options } of collectedCookies) {
    response.cookies.set(name, value, options)
  }
  return response
}
