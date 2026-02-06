import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setMaxLevelForUser() {
  console.log('Finding user...')
  
  // First find the user by email
  const { data: profiles, error: findError } = await supabase
    .from('profiles')
    .select('id, email, total_xp, streak_count')
    .ilike('email', '%dragomirgabriel12%')

  if (findError) {
    console.error('Error finding user:', findError)
    return
  }

  console.log('Found profiles:', profiles)

  if (profiles && profiles.length > 0) {
    const profile = profiles[0]
    console.log('Updating profile:', profile.id)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_xp: 1200, 
        streak_count: 30,
        last_active_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating:', updateError)
    } else {
      console.log('✅ Success! User now has max level (1200 XP, 30 day streak)')
    }
  }
}

setMaxLevelForUser()
