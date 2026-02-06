-- Fix the profile creation trigger
-- Run ONE at a time in Supabase SQL Editor

-- Step 1: Remove old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Remove old function  
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 3: Create new function (copy this entirely)
CREATE OR REPLACE FUNCTION handle_new_user()
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Verify
SELECT 'Trigger created' as status;
