-- Myndir af gerðum: umboð hlaða upp sínum eigin myndum.
-- Skrár liggja sem  bilamyndir/<umbod_id>/<skrá>  – umboð má bara skrifa í sína möppu.

alter table public.gerdir add column if not exists mynd_slod text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bilamyndir', 'bilamyndir', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

create policy "umbod les myndir" on storage.objects for select to authenticated
  using (bucket_id = 'bilamyndir' and public.ma_breyta_umbodi((storage.foldername(name))[1]));
create policy "umbod setja inn myndir" on storage.objects for insert to authenticated
  with check (bucket_id = 'bilamyndir' and public.ma_breyta_umbodi((storage.foldername(name))[1]));
create policy "umbod breyta myndum" on storage.objects for update to authenticated
  using (bucket_id = 'bilamyndir' and public.ma_breyta_umbodi((storage.foldername(name))[1]))
  with check (bucket_id = 'bilamyndir' and public.ma_breyta_umbodi((storage.foldername(name))[1]));
create policy "umbod eyda myndum" on storage.objects for delete to authenticated
  using (bucket_id = 'bilamyndir' and public.ma_breyta_umbodi((storage.foldername(name))[1]));
