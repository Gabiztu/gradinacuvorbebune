-- Fix RLS policies for profile creation
-- Run this in Supabase SQL Editor

-- First, let's check if there are any issues with the trigger
-- Drop and recreate the trigger with better error handling

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, total_xp, streak_count, last_active_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    0,
    0,
    CURRENT_DATE
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE NOTICE 'Profile creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also allow users to INSERT their own profile (fallback)
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
CREATE POLICY "Users can insert own profile on signup" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify messages exist
SELECT COUNT(*) as message_count FROM messages;

-- Check users
SELECT COUNT(*) as user_count FROM auth.users;
