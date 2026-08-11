-- Table: debit card orders
CREATE TABLE IF NOT EXISTS public.debit_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  card_type text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'pending',
  delivery_address text,
  notes text,
  reference text NOT NULL DEFAULT ('CARD-' || upper(substr(md5((random())::text), 1, 10))),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS debit_cards_updated_at ON public.debit_cards;
CREATE TRIGGER debit_cards_updated_at
  BEFORE UPDATE ON public.debit_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS policies
ALTER TABLE public.debit_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS debit_cards_select ON public.debit_cards;
DROP POLICY IF EXISTS debit_cards_insert ON public.debit_cards;
DROP POLICY IF EXISTS debit_cards_admin ON public.debit_cards;

CREATE POLICY debit_cards_select
  ON public.debit_cards FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY debit_cards_insert
  ON public.debit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY debit_cards_update
  ON public.debit_cards FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
