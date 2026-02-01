-- Fix profiles table RLS policies to allow self-insert
-- Run in Supabase SQL Editor

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Recreate with proper insert policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Also fix beneficiaries policies to be more permissive
DROP POLICY IF EXISTS "Users can view own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can insert own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can update own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can delete own beneficiaries" ON beneficiaries;

CREATE POLICY "Users can view own beneficiaries" ON beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries" ON beneficiaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" ON beneficiaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" ON beneficiaries
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Verify
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename IN ('profiles', 'beneficiaries');
