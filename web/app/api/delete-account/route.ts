import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('Cookies count:', cookieStore.getAll().length)
  console.log('Cookie names:', cookieStore.getAll().map(c => c.name))
  console.log('User:', user)
  console.log('Auth error:', authError)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: Record<string, string | null> = {
    favorites: null,
    beneficiaries: null,
    history: null,
    profiles: null,
    auth: null,
  }

  const { error: favError } = await adminClient.from('favorites').delete().eq('user_id', userId)
  results.favorites = favError?.message ?? 'ok'

  const { error: benError } = await adminClient.from('beneficiaries').delete().eq('user_id', userId)
  results.beneficiaries = benError?.message ?? 'ok'

  const { error: histError } = await adminClient.from('history').delete().eq('user_id', userId)
  results.history = histError?.message ?? 'ok'

  const { error: profError } = await adminClient.from('profiles').delete().eq('id', userId)
  results.profiles = profError?.message ?? 'ok'

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
  results.auth = deleteError?.message ?? 'ok'

  console.log('Delete account results:', results)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message, results }, { status: 500 })
  }

  return NextResponse.json({ success: true, results })
}
