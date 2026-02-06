import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function setUserToMaxLevel(email: string) {
  const { data: profiles, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', `%${email}%`)

  if (findError || !profiles || profiles.length === 0) {
    return { success: false, error: 'User not found' }
  }

  const profile = profiles[0]
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      total_xp: 1200, 
      streak_count: 30,
      last_active_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', profile.id)

  if (updateError) {
    return { success: false, error: updateError }
  }

  return { success: true }
}
