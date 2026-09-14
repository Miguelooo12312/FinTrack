-- FinTrack: ejecutar una vez en Supabase > SQL Editor.
-- Un documento JSON por cuenta mantiene la compatibilidad con la aplicación actual.

create table if not exists public.fintrack_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.fintrack_profiles enable row level security;

drop policy if exists "Users read own FinTrack data" on public.fintrack_profiles;
create policy "Users read own FinTrack data" on public.fintrack_profiles
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users insert own FinTrack data" on public.fintrack_profiles;
create policy "Users insert own FinTrack data" on public.fintrack_profiles
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update own FinTrack data" on public.fintrack_profiles;
create policy "Users update own FinTrack data" on public.fintrack_profiles
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
    alter publication supabase_realtime add table public.fintrack_profiles;
exception when duplicate_object then null;
end $$;
