create or replace function public.set_event_attendance_status(
  p_event_id uuid,
  p_profile_id uuid,
  p_status text
)
returns public.attendance
language plpgsql
security definer
set search_path = public
as $$
declare
  current_event public.events;
  updated_attendance public.attendance;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if p_status not in ('present', 'absent', 'late', 'excused') then
    raise exception 'Invalid attendance status.';
  end if;

  select *
  into current_event
  from public.events
  where id = p_event_id;

  if current_event.id is null then
    raise exception 'Event not found.';
  end if;

  if not public.is_chapter_officer(current_event.chapter_id) then
    raise exception 'Only officers can update attendance.';
  end if;

  if not exists (
    select 1
    from public.chapter_members
    where chapter_id = current_event.chapter_id
      and profile_id = p_profile_id
  ) then
    raise exception 'Member is not in this event chapter.';
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
    p_profile_id,
    p_status,
    case when p_status in ('present', 'late') then now() else null end,
    'manual'
  )
  on conflict (event_id, profile_id)
  do update
  set
    status = excluded.status,
    checked_in_at = case
      when excluded.status in ('present', 'late')
        then coalesce(public.attendance.checked_in_at, excluded.checked_in_at, now())
      else null
    end,
    method = 'manual',
    updated_at = now()
  returning * into updated_attendance;

  return updated_attendance;
end;
$$;

grant execute on function public.set_event_attendance_status(uuid, uuid, text) to authenticated;
