-- Check users in Supabase
-- Run in Supabase SQL Editor

-- 1. Check auth.users table
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check profiles table
SELECT id, role, total_xp, streak_count 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
