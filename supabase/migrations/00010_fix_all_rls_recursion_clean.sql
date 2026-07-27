-- ============================================================
-- DROP ALL RECURSIVE / CONFLICTING POLICIES ON EVERY TABLE
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "public_username_email_lookup" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

-- bank_accounts
DROP POLICY IF EXISTS "Users can insert own accounts" ON bank_accounts;
DROP POLICY IF EXISTS "admin_read_all_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can view own accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admins can update all accounts" ON bank_accounts;
DROP POLICY IF EXISTS "admin_update_all_accounts" ON bank_accounts;

-- transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "admin_read_all_transactions" ON transactions;
DROP POLICY IF EXISTS "admin_update_all_transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;

-- kyc_documents
DROP POLICY IF EXISTS "Users can insert own KYC" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can view all KYC" ON kyc_documents;
DROP POLICY IF EXISTS "admin_read_all_kyc" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view own KYC" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can update all KYC" ON kyc_documents;
DROP POLICY IF EXISTS "admin_update_all_kyc" ON kyc_documents;

-- investments
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "admin_read_all_investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "admin_update_all_investments" ON investments;
DROP POLICY IF EXISTS "Admins can update all investments" ON investments;

-- Drop the recursive helper function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- ============================================================
-- RECREATE is_admin() AS SECURITY DEFINER (breaks recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone (even unauthenticated) can look up email by username for login
CREATE POLICY "public_username_email_lookup"
  ON profiles FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- BANK ACCOUNTS
-- ============================================================
CREATE POLICY "bank_accounts_select"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "bank_accounts_insert"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bank_accounts_update"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  USING (
    is_admin() OR
    account_id IN (
      SELECT id FROM bank_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_insert"
  ON transactions FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM bank_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_update"
  ON transactions FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- KYC DOCUMENTS
-- ============================================================
CREATE POLICY "kyc_documents_select"
  ON kyc_documents FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "kyc_documents_insert"
  ON kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_documents_update"
  ON kyc_documents FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- INVESTMENTS
-- ============================================================
CREATE POLICY "investments_select"
  ON investments FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "investments_insert"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_update"
  ON investments FOR UPDATE
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());
