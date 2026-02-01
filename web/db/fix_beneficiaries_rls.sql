-- Fix beneficiaries table RLS policies
-- Run in Supabase SQL Editor

-- 1. Check if RLS is enabled
SELECT tablename, relrowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'beneficiaries';

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Users can view own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can insert own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can update own beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can delete own beneficiaries" ON beneficiaries;

-- 3. Recreate policies with explicit user_id check
CREATE POLICY "Users can view own beneficiaries" ON beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries" ON beneficiaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" ON beneficiaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" ON beneficiaries
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Verify policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'beneficiaries';
