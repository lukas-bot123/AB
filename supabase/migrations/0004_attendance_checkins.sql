create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  checked_in_at timestamptz,
  method text not null check (method in ('code', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create index if not exists attendance_event_id_idx
on public.attendance (event_id);

create index if not exists attendance_profile_id_idx
on public.attendance (profile_id);

alter table public.attendance enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'attendance_set_updated_at'
      and tgrelid = 'public.attendance'::regclass
  ) then
    create trigger attendance_set_updated_at
    before update on public.attendance
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

create policy "attendance_select_own_or_chapter_officers"
on public.attendance
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = attendance.event_id
      and public.is_chapter_member(events.chapter_id)
      and (
        attendance.profile_id = auth.uid()
        or public.is_chapter_officer(events.chapter_id)
      )
  )
);

create or replace function public.start_event_checkin(p_event_id uuid)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  current_event public.events;
  generated_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into current_event
  from public.events
  where id = p_event_id;

  if current_event.id is null then
    raise exception 'Event not found.';
  end if;

  if not public.is_chapter_officer(current_event.chapter_id) then
    raise exception 'Only officers can start check-in.';
  end if;

  if current_event.checkin_opens_at is not null
    and current_event.checkin_closes_at is null then
    return current_event;
  end if;

  generated_code := (floor(random() * 9000)::int + 1000)::text;

  update public.events
  set
    checkin_code = generated_code,
    checkin_opens_at = now(),
    checkin_closes_at = null
  where id = p_event_id
  returning * into current_event;

  return current_event;
end;
$$;

create or replace function public.close_event_checkin(p_event_id uuid)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  current_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into current_event
  from public.events
  where id = p_event_id;

  if current_event.id is null then
    raise exception 'Event not found.';
  end if;

  if not public.is_chapter_officer(current_event.chapter_id) then
    raise exception 'Only officers can close check-in.';
  end if;

  if current_event.checkin_opens_at is null then
    raise exception 'Check-in has not been started.';
  end if;

  if current_event.checkin_closes_at is not null then
    return current_event;
  end if;

  update public.events
  set checkin_closes_at = now()
  where id = p_event_id
  returning * into current_event;

  return current_event;
end;
$$;

create or replace function public.check_in_with_code(p_event_id uuid, p_code text)
returns table (
  result text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_event public.events;
  current_profile_id uuid := auth.uid();
  existing_attendance public.attendance;
  cleaned_code text := btrim(coalesce(p_code, ''));
begin
  if current_profile_id is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into current_event
  from public.events
  where id = p_event_id;

  if current_event.id is null then
    raise exception 'Event not found.';
  end if;

  if not public.is_chapter_member(current_event.chapter_id) then
    raise exception 'You do not have access to this event.';
  end if;

  select *
  into existing_attendance
  from public.attendance
  where event_id = p_event_id
    and profile_id = current_profile_id;

  if existing_attendance.id is not null
    and existing_attendance.status = 'present'
    and existing_attendance.checked_in_at is not null then
    return query
    select 'already_checked_in'::text, 'You are already checked in.'::text;
    return;
  end if;

  if current_event.checkin_opens_at is null then
    return query
    select 'not_open'::text, 'Check-in is not open yet.'::text;
    return;
  end if;

  if current_event.checkin_closes_at is not null then
    return query
    select 'closed'::text, 'Check-in is closed.'::text;
    return;
  end if;

  if current_event.checkin_code is null or cleaned_code <> current_event.checkin_code then
    return query
    select 'wrong_code'::text, 'Wrong check-in code.'::text;
    return;
  end if;

  insert into public.attendance (
    event_id,
    profile_id,
    status,
    checked_in_at,
    method
  )
  values (
    p_event_id,
    current_profile_id,
    'present',
    now(),
    'code'
  )
  on conflict (event_id, profile_id)
  do update
  set
    status = 'present',
    checked_in_at = coalesce(public.attendance.checked_in_at, excluded.checked_in_at),
    method = 'code',
    updated_at = now();

  return query
  select 'checked_in'::text, 'You are checked in.'::text;
end;
$$;

grant select on public.attendance to authenticated;
grant execute on function public.start_event_checkin(uuid) to authenticated;
grant execute on function public.close_event_checkin(uuid) to authenticated;
grant execute on function public.check_in_with_code(uuid, text) to authenticated;
