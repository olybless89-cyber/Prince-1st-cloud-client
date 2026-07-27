
-- KYC documents
create table if not exists public.kyc_documents (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  id_card_type  text not null,
  front_url     text,
  back_url      text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  notes         text,
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger kyc_documents_updated_at before update on public.kyc_documents
  for each row execute function public.set_updated_at();

alter table public.kyc_documents enable row level security;

create policy "Users can view own KYC"
  on public.kyc_documents for select using (auth.uid() = user_id);

create policy "Users can insert own KYC"
  on public.kyc_documents for insert with check (auth.uid() = user_id);

create policy "Admins can view all KYC"
  on public.kyc_documents for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update all KYC"
  on public.kyc_documents for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Contact messages
create table if not exists public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert with check (true);

create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
