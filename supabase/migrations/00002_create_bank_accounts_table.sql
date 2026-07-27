
-- Bank accounts
create table if not exists public.bank_accounts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  account_number text unique not null default lpad(floor(random()*9000000000+1000000000)::text, 10, '0'),
  account_type   text not null default 'savings' check (account_type in ('savings','checking','corporate','student','joint','fixed')),
  currency       text not null default 'USD',
  balance        numeric(18,2) not null default 0,
  branch         text,
  apy            numeric(5,2),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger bank_accounts_updated_at before update on public.bank_accounts
  for each row execute function public.set_updated_at();

alter table public.bank_accounts enable row level security;

create policy "Users can view own accounts"
  on public.bank_accounts for select using (auth.uid() = user_id);

create policy "Users can insert own accounts"
  on public.bank_accounts for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.bank_accounts for update using (auth.uid() = user_id);

create policy "Admins can view all accounts"
  on public.bank_accounts for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all accounts"
  on public.bank_accounts for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
