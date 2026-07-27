-- Fix: set email_verified to false in identity_data (matches working users)
-- AND ensure the handle_new_user trigger didn't conflict
UPDATE auth.identities 
SET identity_data = jsonb_build_object(
  'sub',            'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  'email',          'admin@grayhavenbk.com',
  'email_verified', false,
  'phone_verified', false
),
updated_at = NOW()
WHERE user_id = 'bebdc073-77ff-4b3d-8c34-97c7c61dadf8';

-- Also update auth.users updated_at so it's not stale
UPDATE auth.users SET updated_at = NOW() 
WHERE id = 'bebdc073-77ff-4b3d-8c34-97c7c61dadf8';

-- Verify profile exists correctly
SELECT id, email, username, role, login_pin FROM public.profiles 
WHERE id = 'bebdc073-77ff-4b3d-8c34-97c7c61dadf8';