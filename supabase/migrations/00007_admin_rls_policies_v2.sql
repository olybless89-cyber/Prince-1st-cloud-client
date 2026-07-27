
-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles: admin can read/update all
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
CREATE POLICY "admin_update_all_profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- bank_accounts: uses user_id
DROP POLICY IF EXISTS "admin_read_all_accounts" ON public.bank_accounts;
CREATE POLICY "admin_read_all_accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_update_all_accounts" ON public.bank_accounts;
CREATE POLICY "admin_update_all_accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- transactions: uses account_id (join to bank_accounts for ownership check)
DROP POLICY IF EXISTS "admin_read_all_transactions" ON public.transactions;
CREATE POLICY "admin_read_all_transactions" ON public.transactions
  FOR SELECT USING (
    public.is_admin() OR
    account_id IN (SELECT id FROM public.bank_accounts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_all_transactions" ON public.transactions;
CREATE POLICY "admin_update_all_transactions" ON public.transactions
  FOR UPDATE USING (public.is_admin());

-- kyc_documents: uses user_id
DROP POLICY IF EXISTS "admin_read_all_kyc" ON public.kyc_documents;
CREATE POLICY "admin_read_all_kyc" ON public.kyc_documents
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_update_all_kyc" ON public.kyc_documents;
CREATE POLICY "admin_update_all_kyc" ON public.kyc_documents
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- investments: uses user_id
DROP POLICY IF EXISTS "admin_read_all_investments" ON public.investments;
CREATE POLICY "admin_read_all_investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_update_all_investments" ON public.investments;
CREATE POLICY "admin_update_all_investments" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
