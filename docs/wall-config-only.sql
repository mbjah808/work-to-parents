-- Paste in Supabase SQL Editor (project class-photo-wall) if wall_config is missing.
-- Shared class PIN across devices (hash only).

create table if not exists public.wall_config (
  id int primary key check (id = 1),
  pin_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.wall_config enable row level security;
drop policy if exists "anon read wall_config" on public.wall_config;
drop policy if exists "anon insert wall_config" on public.wall_config;
drop policy if exists "anon update wall_config" on public.wall_config;
create policy "anon read wall_config" on public.wall_config for select to anon using (true);
create policy "anon insert wall_config" on public.wall_config for insert to anon with check (id = 1);
create policy "anon update wall_config" on public.wall_config for update to anon using (true) with check (id = 1);
