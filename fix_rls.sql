-- Add these policies to Supabase SQL Editor

-- Analytics Logs: All authenticated users can insert (for tracking sent messages)
CREATE POLICY "Users can insert analytics logs" ON analytics_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- History: All authenticated users can insert (for tracking sent messages)
CREATE POLICY "Users can insert history" ON history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profiles: All authenticated users can insert (for profile creation during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Make profiles insert policy work (sometimes RLS blocks insert before trigger)
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN id SET DATA TYPE UUID;
