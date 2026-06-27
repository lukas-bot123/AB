create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('yes', 'no', 'maybe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create index if not exists rsvps_event_id_idx
on public.rsvps (event_id);

create index if not exists rsvps_profile_id_idx
on public.rsvps (profile_id);

alter table public.rsvps enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'rsvps_set_updated_at'
      and tgrelid = 'public.rsvps'::regclass
  ) then
    create trigger rsvps_set_updated_at
    before update on public.rsvps
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

create policy "rsvps_select_chapter_members"
on public.rsvps
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = rsvps.event_id
      and public.is_chapter_member(events.chapter_id)
  )
);

create policy "rsvps_insert_own_for_chapter_events"
on public.rsvps
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = rsvps.event_id
      and public.is_chapter_member(events.chapter_id)
  )
);

create policy "rsvps_update_own_for_chapter_events"
on public.rsvps
for update
to authenticated
using (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = rsvps.event_id
      and public.is_chapter_member(events.chapter_id)
  )
)
with check (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.events
    where events.id = rsvps.event_id
      and public.is_chapter_member(events.chapter_id)
  )
);

grant select, insert, update on public.rsvps to authenticated;
