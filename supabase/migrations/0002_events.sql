create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (length(btrim(title)) > 0),
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_required boolean not null default false,
  checkin_code text,
  checkin_opens_at timestamptz,
  checkin_closes_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index if not exists events_chapter_id_starts_at_idx
on public.events (chapter_id, starts_at);

create index if not exists events_created_by_idx
on public.events (created_by);

alter table public.events enable row level security;

create or replace function public.is_chapter_officer(p_chapter_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chapter_members
    where chapter_id = p_chapter_id
      and profile_id = auth.uid()
      and role = 'officer'
  );
$$;

create policy "events_select_chapter_members"
on public.events
for select
to authenticated
using (public.is_chapter_member(chapter_id));

create policy "events_insert_chapter_officers"
on public.events
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_chapter_officer(chapter_id)
);

grant select, insert on public.events to authenticated;
grant execute on function public.is_chapter_officer(uuid) to authenticated;
