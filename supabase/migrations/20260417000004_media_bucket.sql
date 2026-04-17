-- Public media storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  10485760,  -- 10 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do nothing;

-- Allow public read
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

-- Allow all uploads (service role used from API, so this is fine)
drop policy if exists "media upload" on storage.objects;
create policy "media upload" on storage.objects
  for insert with check (bucket_id = 'media');

drop policy if exists "media delete" on storage.objects;
create policy "media delete" on storage.objects
  for delete using (bucket_id = 'media');
