-- Find your user ID first
SELECT auth.users.id, auth.users.email 
FROM auth.users 
WHERE auth.users.email = 'dragomirgabriel12@yahoo.com';

-- Then update your profile (replace USER_ID with the id from above)
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';
