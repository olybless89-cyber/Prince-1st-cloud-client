-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "Public username lookup for login" ON profiles;

-- 1. Public SELECT: anyone can look up email by username (needed for login before auth)
CREATE POLICY "public_username_email_lookup"
  ON profiles FOR SELECT
  USING (true);

-- 2. Users can update their own profile only
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
