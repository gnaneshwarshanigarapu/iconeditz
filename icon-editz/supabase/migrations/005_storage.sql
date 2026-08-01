-- Supabase Storage is installed with every hosted project.  Bucket creation is conflict-safe.
insert into storage.buckets (id, name, public) values
  ('icon-editz-assets', 'icon-editz-assets', false),
  ('hire-request-files', 'hire-request-files', false)
on conflict (id) do nothing;

-- `storage.objects` is owned by Supabase Storage. Its managed schema enables RLS before
-- user migrations run; do not ALTER it here because hosted migration roles do not own it.
drop policy if exists storage_admin_manage on storage.objects;
create policy storage_admin_manage on storage.objects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
