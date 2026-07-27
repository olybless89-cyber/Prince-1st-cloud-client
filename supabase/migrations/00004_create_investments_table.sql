
-- Investments
create table if not exists public.investments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  plan_name     text not null,
  amount        numeric(18,2) not null,
  roi_percent   numeric(6,2) not null,
  roi_type      text not null default 'fixed',
  duration_days integer not null,
  status        text not null default 'active' check (status in ('active','completed','cancelled')),
  started_at    timestamptz not null default now(),
  ends_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_investments_user_id on public.investments(user_id);

alter table public.investments enable row level security;

create policy "Users can view own investments"
  on public.investments for select using (auth.uid() = user_id);

create policy "Users can insert own investments"
  on public.investments for insert with check (auth.uid() = user_id);

create policy "Admins can view all investments"
  on public.investments for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all investments"
  on public.investments for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
