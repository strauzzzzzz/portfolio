-- Run once in Supabase: SQL Editor -> New query -> Run.
-- Visitors can read everything; only a signed-in user can change content or upload media.
-- Safe to re-run.

alter table public.projects enable row level security;
alter table public.items enable row level security;

-- projects
drop policy if exists "projects public read" on public.projects;
drop policy if exists "projects admin insert" on public.projects;
drop policy if exists "projects admin update" on public.projects;
drop policy if exists "projects admin delete" on public.projects;

create policy "projects public read" on public.projects
  for select using (true);
create policy "projects admin insert" on public.projects
  for insert to authenticated with check (true);
create policy "projects admin update" on public.projects
  for update to authenticated using (true) with check (true);
create policy "projects admin delete" on public.projects
  for delete to authenticated using (true);

-- items
drop policy if exists "items public read" on public.items;
drop policy if exists "items admin insert" on public.items;
drop policy if exists "items admin update" on public.items;
drop policy if exists "items admin delete" on public.items;

create policy "items public read" on public.items
  for select using (true);
create policy "items admin insert" on public.items
  for insert to authenticated with check (true);
create policy "items admin update" on public.items
  for update to authenticated using (true) with check (true);
create policy "items admin delete" on public.items
  for delete to authenticated using (true);

-- storage bucket "media" (create it as a public bucket if it does not exist yet)
drop policy if exists "media public read" on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;

create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
