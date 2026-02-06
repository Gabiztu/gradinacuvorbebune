import { createClient } from '@/lib/supabase/client'

export async function logMessageAction(
  messageId: string,
  actionType: 'view' | 'share' | 'favorite' | 'copy' | 'send',
  beneficiaryAgeRange?: string,
  userRole?: string
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // IMPORTANT: Facem un INSERT simplu. 
    // ID-ul se generează automat în bază, deci nu mai avem erori 409.
    const { error } = await supabase
      .from('message_usage')
      .insert({
        user_id: user.id,
        message_id: messageId,
        action_type: actionType,
        beneficiary_age_range: beneficiaryAgeRange || null,
        user_role: userRole || null
      })

    if (error) console.error('Eroare Analytics:', error.message)
  } catch (err) {
    console.error('Logging eșuat:', err)
  }
}