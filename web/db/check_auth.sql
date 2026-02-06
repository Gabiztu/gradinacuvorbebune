-- Check Supabase Auth Configuration
-- Run in Supabase SQL Editor

-- 1. Check if auth schema exists and tables are there
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 2. Check extensions
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 3. Check auth.users structure
DESCRIBE auth.users;

-- 4. Try to insert a user manually (for testing)
-- This should work if the schema is set up correctly
