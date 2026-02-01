require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing')
  process.exit(1)
}

const supabase = require('@supabase/supabase-js').createClient(supabaseUrl, supabaseServiceKey)

async function setMaxLevel() {
  console.log('Looking for user dragomirgabriel12@yahoo.com...')
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, total_xp, streak_count')
    .ilike('email', '%dragomirgabriel12%')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Found:', profiles)

  if (profiles && profiles.length > 0) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_xp: 1200, 
        streak_count: 30,
        last_active_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', profiles[0].id)

    if (updateError) {
      console.error('Update error:', updateError)
    } else {
      console.log('✅ SUCCESS! User updated to max level (1200 XP, 30 day streak)')
    }
  } else {
    console.log('User not found')
  }
}

setMaxLevel()
