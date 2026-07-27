
-- Storage bucket for KYC documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc_documents',
  'kyc_documents',
  false,
  10485760, -- 10MB
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do nothing;

-- RLS policies for kyc_documents bucket
create policy "Users can upload own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc_documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc_documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can view all KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc_documents'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
