
-- Transactions
create table if not exists public.transactions (
  id                uuid primary key default uuid_generate_v4(),
  account_id        uuid not null references public.bank_accounts(id) on delete cascade,
  type              text not null check (type in ('deposit','withdrawal','transfer','interest')),
  status            text not null default 'completed' check (status in ('pending','completed','failed','cancelled')),
  amount            numeric(18,2) not null,
  currency          text not null default 'USD',
  description       text,
  recipient_account text,
  reference         text unique not null default 'TXN-' || upper(substr(md5(random()::text), 1, 12)),
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now()
);

create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.bank_accounts ba
      where ba.id = account_id and ba.user_id = auth.uid()
    )
  );

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.bank_accounts ba
      where ba.id = account_id and ba.user_id = auth.uid()
    )
  );

create policy "Admins can view all transactions"
  on public.transactions for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all transactions"
  on public.transactions for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
