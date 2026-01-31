-- ============================================
-- ADMIN DASHBOARD DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add admin role to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'teacher', 'admin'));

-- 2. Create message usage tracking table
CREATE TABLE IF NOT EXISTS public.message_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('copy', 'send', 'whatsapp')),
    beneficiary_age_range TEXT,
    user_role TEXT CHECK (user_role IN ('parent', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_usage_user_id ON public.message_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_message_usage_message_id ON public.message_usage(message_id);
CREATE INDEX IF NOT EXISTS idx_message_usage_action_type ON public.message_usage(action_type);
CREATE INDEX IF NOT EXISTS idx_message_usage_created_at ON public.message_usage(created_at);

-- 4. Enable Row Level Security for message_usage
ALTER TABLE public.message_usage ENABLE ROW LEVEL SECURITY;

-- Only admins can view all usage data
CREATE POLICY "Admins can view all message usage" ON public.message_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Users can insert their own usage
CREATE POLICY "Users can insert their own usage" ON public.message_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View 1: User Statistics (Parents vs Teachers)
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT 
    COUNT(*) FILTER (WHERE role = 'parent') as total_parents,
    COUNT(*) FILTER (WHERE role = 'teacher') as total_teachers,
    COUNT(*) FILTER WHERE is_admin = true as total_admins,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7_days
FROM public.profiles;

-- View 2: Message Usage Statistics
CREATE OR REPLACE VIEW public.admin_message_stats AS
SELECT 
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE action_type = 'copy') as total_copies,
    COUNT(*) FILTER (WHERE action_type = 'send') as total_sends,
    COUNT(*) FILTER (WHERE action_type = 'whatsapp') as total_whatsapp,
    COUNT(DISTINCT message_id) as unique_messages_used,
    COUNT(DISTINCT user_id) as active_users,
    (COUNT(*) FILTER (WHERE action_type = 'whatsapp') * 100.0 / NULLIF(COUNT(*), 0)) as whatsapp_percentage,
    (COUNT(*) FILTER (WHERE action_type = 'copy') * 100.0 / NULLIF(COUNT(*), 0)) as copy_percentage
FROM public.message_usage;

-- View 3: Age Category Popularity
CREATE OR REPLACE VIEW public.admin_age_stats AS
SELECT 
    beneficiary_age_range,
    COUNT(*) as usage_count,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.message_usage WHERE beneficiary_age_range IS NOT NULL), 0), 1) as percentage
FROM public.message_usage
WHERE beneficiary_age_range IS NOT NULL
GROUP BY beneficiary_age_range
ORDER BY usage_count DESC;

-- View 4: Most Used Messages
CREATE OR REPLACE VIEW public.admin_top_messages AS
SELECT 
    m.id,
    m.content,
    m.category,
    COUNT(*) as usage_count,
    COUNT(*) FILTER (WHERE mu.action_type = 'copy') as copies,
    COUNT(*) FILTER (WHERE mu.action_type = 'whatsapp') as whatsapp_shares,
    COUNT(*) FILTER (WHERE mu.action_type = 'send') as sends
FROM public.messages m
LEFT JOIN public.message_usage mu ON m.id = mu.message_id
WHERE m.is_active = true
GROUP BY m.id
ORDER BY usage_count DESC
LIMIT 20;

-- View 5: Daily Activity (last 30 days)
CREATE OR REPLACE VIEW public.admin_daily_activity AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as active_users
FROM public.message_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get admin stats as JSON
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_stats', (SELECT json_agg(row_to_json(admin_user_stats)) FROM admin_user_stats),
        'message_stats', (SELECT json_agg(row_to_json(admin_message_stats)) FROM admin_message_stats),
        'age_stats', (SELECT json_agg(row_to_json(admin_age_stats)) FROM admin_age_stats),
        'top_messages', (SELECT json_agg(row_to_json(admin_top_messages)) FROM admin_top_messages),
        'daily_activity', (SELECT json_agg(row_to_json(admin_daily_activity)) FROM admin_daily_activity)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED ADMIN USER (Optional)
-- ============================================
-- Run this to make a user an admin (replace with actual user ID):
-- UPDATE public.profiles SET is_admin = true, role = 'admin' WHERE id = 'your-user-id';

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================
-- INSERT INTO public.message_usage (user_id, message_id, action_type, beneficiary_age_range, user_role)
-- SELECT 
--     p.id,
--     m.id,
--     (ARRAY['copy', 'send', 'whatsapp'])[floor(random() * 3)::int + 1],
--     (ARRAY['8-10', '11-13', '14-16', '17-20'])[floor(random() * 4)::int + 1],
--     (ARRAY['parent', 'teacher'])[floor(random() * 2)::int + 1]
-- FROM public.profiles p
-- CROSS JOIN public.messages m
-- LIMIT 100;
