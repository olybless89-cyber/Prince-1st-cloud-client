-- Get admin user IDs first
DO $$
DECLARE
  admin_ids uuid[];
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users WHERE email IN ('admin@grayhavenbk.com','grayhaven.admin@gmail.com'))
  INTO admin_ids;

  IF array_length(admin_ids, 1) IS NULL THEN
    RAISE NOTICE 'No admin users found to delete';
    RETURN;
  END IF;

  DELETE FROM auth.identities    WHERE user_id = ANY(admin_ids);
  DELETE FROM auth.sessions      WHERE user_id = ANY(admin_ids);
  DELETE FROM auth.refresh_tokens WHERE user_id::uuid = ANY(admin_ids);
  DELETE FROM auth.mfa_factors   WHERE user_id = ANY(admin_ids);
  DELETE FROM public.profiles    WHERE id = ANY(admin_ids);
  DELETE FROM auth.users         WHERE id = ANY(admin_ids);

  RAISE NOTICE 'Deleted % admin user(s)', array_length(admin_ids, 1);
END $$;

SELECT COUNT(*) AS remaining FROM auth.users 
WHERE email IN ('admin@grayhavenbk.com','grayhaven.admin@gmail.com');