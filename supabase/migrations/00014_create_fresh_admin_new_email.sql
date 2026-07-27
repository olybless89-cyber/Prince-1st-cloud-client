-- Create a brand new admin user with a fresh email (avoids any cached platform state)
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, aud, role,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user, is_anonymous,
    created_at, updated_at
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000',
    'grayhaven.admin@gmail.com',
    crypt('skb_1234', gen_salt('bf', 10)),
    'authenticated', 'authenticated',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"Gray Haven","username":"ghadmin","role":"admin"}',
    FALSE, FALSE, FALSE,
    NOW(), NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id,
    jsonb_build_object(
      'sub', new_id::text,
      'email', 'grayhaven.admin@gmail.com',
      'email_verified', false,
      'phone_verified', false
    ),
    'email', new_id::text,
    NOW(), NOW(), NOW()
  );

  -- Update the profile inserted by trigger to have admin role
  UPDATE public.profiles SET
    username  = 'ghadmin',
    first_name = 'Admin',
    last_name  = 'Gray Haven',
    role       = 'admin',
    login_pin  = '1234'
  WHERE id = new_id;

  RAISE NOTICE 'New admin ID: %', new_id;
END $$;