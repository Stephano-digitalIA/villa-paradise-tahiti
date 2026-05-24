import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: CookieOptions }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user exists in admin_users — no auto-provisioning (manual only)
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (adminUser) {
        // Sync Google profile info on every login
        await supabase
          .from('admin_users')
          .update({
            full_name: data.user.user_metadata?.full_name ?? null,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
          })
          .eq('id', data.user.id)

        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // Authenticated with Google but not an admin — sign out and reject
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/admin/auth?error=unauthorized`
        )
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/auth?error=auth_failed`)
}
