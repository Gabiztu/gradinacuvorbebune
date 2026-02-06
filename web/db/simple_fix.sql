-- Simple profile creation fix
-- Run each statement separately in Supabase SQL Editor

-- 1. First, drop existing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Create function (run this as ONE statement)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
  INSERT INTO profiles (id, role, total_xp, streak_count, last_active_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    0,
    0,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
