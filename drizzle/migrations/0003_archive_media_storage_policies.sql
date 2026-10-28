create policy "Archive media files are readable" on storage.objects for select to anon, authenticated
  using (bucket_id = 'archive-media');
create policy "Editors upload archive media" on storage.objects for insert to authenticated
  with check (bucket_id = 'archive-media' and public.is_editor(auth.uid()));
create policy "Editors update archive media" on storage.objects for update to authenticated
  using (bucket_id = 'archive-media' and public.is_editor(auth.uid()));
create policy "Editors delete archive media" on storage.objects for delete to authenticated
  using (bucket_id = 'archive-media' and public.is_editor(auth.uid()));