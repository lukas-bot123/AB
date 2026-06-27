create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  university text,
  invite_code text not null unique check (length(btrim(invite_code)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.chapter_members (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('officer', 'member')),
  created_at timestamptz not null default now(),
  unique (chapter_id, profile_id)
);

create index if not exists chapter_members_chapter_id_idx on public.chapter_members (chapter_id);
create index if not exists chapter_members_profile_id_idx on public.chapter_members (profile_id);

alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_members enable row level security;

create or replace function public.is_chapter_member(p_chapter_id uuid)
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
  );
$$;

create or replace function public.shares_chapter_with_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chapter_members mine
    join public.chapter_members theirs
      on theirs.chapter_id = mine.chapter_id
    where mine.profile_id = auth.uid()
      and theirs.profile_id = p_profile_id
  );
$$;

create policy "profiles_select_own_or_chapter"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.shares_chapter_with_profile(id)
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "chapters_select_members"
on public.chapters
for select
to authenticated
using (public.is_chapter_member(id));

create policy "chapter_members_select_members"
on public.chapter_members
for select
to authenticated
using (public.is_chapter_member(chapter_id));

create or replace function public.create_chapter_with_membership(
  p_name text,
  p_university text,
  p_invite_code text
)
returns table (
  chapter_id uuid,
  chapter_name text,
  university text,
  invite_code text,
  membership_id uuid,
  role text,
  chapter_created_at timestamptz,
  membership_created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  created_chapter public.chapters;
  created_membership public.chapter_members;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required.';
  end if;

  if length(btrim(p_name)) = 0 then
    raise exception 'Chapter name is required.';
  end if;

  if not exists (select 1 from public.profiles where id = current_profile_id) then
    raise exception 'Profile is required before creating a chapter.';
  end if;

  insert into public.chapters (name, university, invite_code)
  values (
    btrim(p_name),
    nullif(btrim(coalesce(p_university, '')), ''),
    upper(btrim(p_invite_code))
  )
  returning * into created_chapter;

  insert into public.chapter_members (chapter_id, profile_id, role)
  values (created_chapter.id, current_profile_id, 'officer')
  returning * into created_membership;

  return query
  select
    created_chapter.id,
    created_chapter.name,
    created_chapter.university,
    created_chapter.invite_code,
    created_membership.id,
    created_membership.role,
    created_chapter.created_at,
    created_membership.created_at;
end;
$$;

create or replace function public.join_chapter_by_invite_code(p_invite_code text)
returns table (
  chapter_id uuid,
  chapter_name text,
  university text,
  invite_code text,
  membership_id uuid,
  role text,
  chapter_created_at timestamptz,
  membership_created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  target_chapter public.chapters;
  joined_membership public.chapter_members;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required.';
  end if;

  if length(btrim(p_invite_code)) = 0 then
    raise exception 'Invite code is required.';
  end if;

  if not exists (select 1 from public.profiles where id = current_profile_id) then
    raise exception 'Profile is required before joining a chapter.';
  end if;

  select *
  into target_chapter
  from public.chapters
  where chapters.invite_code = upper(btrim(p_invite_code));

  if target_chapter.id is null then
    raise exception 'Invalid invite code.';
  end if;

  select membership.*
  into joined_membership
  from public.chapter_members as membership
  where membership.chapter_id = target_chapter.id
    and membership.profile_id = current_profile_id;

  if joined_membership.id is null then
    insert into public.chapter_members (chapter_id, profile_id, role)
    values (target_chapter.id, current_profile_id, 'member')
    returning * into joined_membership;
  end if;

  return query
  select
    target_chapter.id,
    target_chapter.name,
    target_chapter.university,
    target_chapter.invite_code,
    joined_membership.id,
    joined_membership.role,
    target_chapter.created_at,
    joined_membership.created_at;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.chapters to authenticated;
grant select on public.chapter_members to authenticated;
grant execute on function public.is_chapter_member(uuid) to authenticated;
grant execute on function public.shares_chapter_with_profile(uuid) to authenticated;
grant execute on function public.create_chapter_with_membership(text, text, text) to authenticated;
grant execute on function public.join_chapter_by_invite_code(text) to authenticated;
