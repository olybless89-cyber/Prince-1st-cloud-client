-- Allow unauthenticated users to look up email by username (needed for login flow)
CREATE POLICY "Public username lookup for login"
  ON profiles
  FOR SELECT
  USING (true);
