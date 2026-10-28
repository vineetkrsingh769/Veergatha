drop policy "Archive media files are readable" on storage.objects;
create policy "Published archive media files are readable" on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'archive-media'
    and (
      public.is_editor(auth.uid())
      or exists (select 1 from public.media m where m.storage_path = storage.objects.name and m.verification = 'verified')
    )
  );