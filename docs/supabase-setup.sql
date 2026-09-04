-- Class Photo Wall — Supabase free Spark setup
-- 1) Create a public Storage bucket named: class-photos
-- 2) Run this script in the SQL Editor
-- 3) Put Project URL + anon key in .env as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
-- 4) Rebuild the static site

create table if not exists public.photos (
  id uuid primary key,
  caption text not null default '',
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "anon read photos" on public.photos;
drop policy if exists "anon insert photos" on public.photos;
drop policy if exists "anon delete photos" on public.photos;

create policy "anon read photos" on public.photos
  for select to anon using (true);

create policy "anon insert photos" on public.photos
  for insert to anon with check (true);

create policy "anon delete photos" on public.photos
  for delete to anon using (true);

-- Storage policies (bucket must already exist and be public for easy gallery URLs)
drop policy if exists "anon read class-photos" on storage.objects;
drop policy if exists "anon upload class-photos" on storage.objects;
drop policy if exists "anon delete class-photos" on storage.objects;

create policy "anon read class-photos"
  on storage.objects for select to anon
  using (bucket_id = 'class-photos');

create policy "anon upload class-photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'class-photos');

create policy "anon delete class-photos"
  on storage.objects for delete to anon
  using (bucket_id = 'class-photos');
