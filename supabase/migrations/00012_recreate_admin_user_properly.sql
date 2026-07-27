-- Insert admin user with ALL required fields Supabase Auth needs
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, aud, role,
  email_confirmed_at, confirmation_sent_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, is_sso_user, is_anonymous,
  created_at, updated_at
) VALUES (
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  '00000000-0000-0000-0000-000000000000',
  'admin@grayhavenbk.com',
  crypt('skb_1234', gen_salt('bf', 10)),
  'authenticated', 'authenticated',
  NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"Gray Haven","username":"admin","role":"admin"}',
  FALSE, FALSE, FALSE,
  NOW(), NOW()
);

-- Insert required identity record
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  jsonb_build_object(
    'sub',            'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
    'email',          'admin@grayhavenbk.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email', 'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  NOW(), NOW(), NOW()
);

-- Ensure profile row is intact (correct columns)
INSERT INTO public.profiles (id, email, username, first_name, last_name, role, login_pin)
VALUES (
  'bebdc073-77ff-4b3d-8c34-97c7c61dadf8',
  'admin@grayhavenbk.com',
  'admin', 'Admin', 'Gray Haven', 'admin', '1234'
) ON CONFLICT (id) DO UPDATE SET
  email      = EXCLUDED.email,
  username   = EXCLUDED.username,
  first_name = EXCLUDED.first_name,
  last_name  = EXCLUDED.last_name,
  role       = EXCLUDED.role,
  login_pin  = EXCLUDED.login_pin;
