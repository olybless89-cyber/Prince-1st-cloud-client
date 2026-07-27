-- Insert the missing email identity record for the admin user
-- This is required by Supabase Auth for signInWithPassword to work
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',  -- same as user id for email provider
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  jsonb_build_object(
    'sub', 'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
    'email', 'admin@grayhavenbk.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',  -- provider_id = user_id for email
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO UPDATE
  SET identity_data = EXCLUDED.identity_data,
      updated_at = NOW();