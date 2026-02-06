import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { email } = await request.json()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Update the user's profile to max level
  const { error } = await supabase
    .from('profiles')
    .update({ 
      total_xp: 1200, 
      streak_count: 30,
      last_active_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Set to max level! Refresh the page.',
    xp: 1200,
    streak: 30
  })
}
