export type UserRole = 'parent' | 'teacher' | 'admin'
export type BeneficiaryAgeRange = '8-10' | '11-13' | '14-16' | '17-20'
export type MessageCategory = 
  | 'school_harmony' 
  | 'exams_tests' 
  | 'overcoming_failure' 
  | 'family_reconnection' 
  | 'personalized'

export interface Profile {
  id: string
  role: UserRole
  is_admin?: boolean
  total_xp: number
  streak_count: number
  first_name?: string
  last_active_date: string | null
  created_at: string
  updated_at: string
}

export interface Beneficiary {
  id: string
  user_id: string
  first_name: string
  age_range: BeneficiaryAgeRange
  relation: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  content: string
  category: MessageCategory
  age_range: BeneficiaryAgeRange[]
  role_target: UserRole[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Favorite {
  user_id: string
  message_id: string
  created_at: string
}

export interface HistoryEntry {
  id: string
  user_id: string
  message_id: string | null
  beneficiary_name: string
  created_at: string
}

export interface HistoryWithMessage extends HistoryEntry {
  messages?: Pick<Message, 'id' | 'content' | 'category'>
}

export interface AnalyticsLog {
  id: string
  message_id: string | null
  sender_role: UserRole
  beneficiary_age_range: BeneficiaryAgeRange
  created_at: string
}

export interface GardenState {
  streak: number
  xp: number
}

export interface ProposedMessage {
  id: string
  user_id: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: {
    first_name: string
    email: string
  }
}
