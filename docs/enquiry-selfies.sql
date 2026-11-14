-- Selfies from the enquiry chat: a private bucket the website can upload into (never read), plus the column
-- that links a selfie to its enquiry. Only the enquiry-email function (service role) reads the photos.
alter table public.enquiries add column if not exists selfie_path text;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('selfies', 'selfies', false, 3145728, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "website can upload selfies" on storage.objects;
create policy "website can upload selfies" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'selfies' and name ~ '^[0-9a-f-]{36}\.jpg$');
