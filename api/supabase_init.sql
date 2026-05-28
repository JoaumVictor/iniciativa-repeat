begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'goal_status'
      and n.nspname = 'public'
  ) then
    create type public.goal_status as enum ('bulking', 'cutting', 'maintenance', 'recomp', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'party_member_role'
      and n.nspname = 'public'
  ) then
    create type public.party_member_role as enum ('owner', 'admin', 'member');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'party_member_status'
      and n.nspname = 'public'
  ) then
    create type public.party_member_status as enum ('active', 'pending', 'blocked', 'left');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'post_reaction_kind'
      and n.nspname = 'public'
  ) then
    create type public.post_reaction_kind as enum ('like', 'dislike');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'gender_kind'
      and n.nspname = 'public'
  ) then
    create type public.gender_kind as enum ('male', 'female', 'non_binary', 'other', 'prefer_not_to_say');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'member_request_status'
      and n.nspname = 'public'
  ) then
    create type public.member_request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  username citext unique,
  full_name text,
  nickname text,
  bio text,
  avatar_url text,
  banner_url text,
  gender public.gender_kind,
  birth_date date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  biceps_cm numeric(5,2),
  chest_cm numeric(5,2),
  waist_cm numeric(5,2),
  thigh_cm numeric(5,2),
  neck_cm numeric(5,2),
  goal_status public.goal_status,
  streak_days integer not null default 0,
  last_checkin_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_streak_non_negative check (streak_days >= 0)
);

create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  avatar_url text,
  banner_url text,
  theme_background_color text not null default '#0b1120',
  post_card_color text not null default '#111827',
  is_private boolean not null default true,
  invite_code text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.party_members (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.party_member_role not null default 'member',
  status public.party_member_status not null default 'pending',
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint party_members_unique unique (party_id, user_id)
);

create table if not exists public.party_favorites (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint party_favorites_unique unique (party_id, user_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text_content text,
  image_url text,
  like_count integer not null default 0,
  dislike_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction public.post_reaction_kind not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint post_reactions_unique unique (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint checkins_unique unique (user_id, checkin_date)
);

create table if not exists public.party_join_requests (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  invite_code text,
  status public.member_request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint party_join_requests_unique unique (party_id, user_id)
);

create index if not exists idx_parties_owner_id on public.parties(owner_id);
create index if not exists idx_party_members_party_id on public.party_members(party_id);
create index if not exists idx_party_members_user_id on public.party_members(user_id);
create index if not exists idx_party_favorites_user_id on public.party_favorites(user_id);
create index if not exists idx_posts_party_id_created_at on public.posts(party_id, created_at desc);
create index if not exists idx_post_reactions_post_id on public.post_reactions(post_id);
create index if not exists idx_comments_post_id_created_at on public.comments(post_id, created_at asc);
create index if not exists idx_checkins_user_id_date on public.checkins(user_id, checkin_date desc);
create index if not exists idx_party_join_requests_party_id on public.party_join_requests(party_id);

create or replace function public.is_party_member(target_party_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.party_members pm
    where pm.party_id = target_party_id
      and pm.user_id = target_user_id
      and pm.status = 'active'
  );
$$;

create or replace function public.is_party_admin(target_party_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.party_members pm
    where pm.party_id = target_party_id
      and pm.user_id = target_user_id
      and pm.status = 'active'
      and pm.role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    username,
    full_name,
    nickname,
    avatar_url,
    banner_url,
    bio,
    gender,
    birth_date,
    streak_days,
    last_checkin_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'nickname',
    new.raw_user_meta_data ->> 'avatar_url',
    null,
    null,
    null,
    null,
    0,
    null,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      username = coalesce(excluded.username, public.profiles.username),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.prevent_profile_email_change()
returns trigger
language plpgsql
as $$
begin
  if new.id <> old.id then
    raise exception 'profile id cannot be changed';
  end if;

  if new.email is distinct from old.email and auth.uid() <> old.id then
    raise exception 'email can only be changed through auth provider';
  end if;

  return new;
end;
$$;

create or replace function public.sync_party_member_owner()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'owner' then
    update public.parties
    set owner_id = new.user_id,
        updated_at = timezone('utc', now())
    where id = new.party_id;
  end if;

  return new;
end;
$$;

create or replace function public.create_party_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.party_members (
    party_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.owner_id,
    'owner',
    'active',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (party_id, user_id) do update
  set role = 'owner',
      status = 'active',
      joined_at = coalesce(public.party_members.joined_at, excluded.joined_at),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.join_party_by_code(party_invite_code text)
returns public.party_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target_party public.parties;
  membership public.party_members;
begin
  select *
  into target_party
  from public.parties
  where invite_code = party_invite_code
  limit 1;

  if not found then
    raise exception 'invalid party invite code';
  end if;

  insert into public.party_members (
    party_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  values (
    target_party.id,
    auth.uid(),
    'member',
    'active',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (party_id, user_id) do update
  set status = 'active',
      joined_at = coalesce(public.party_members.joined_at, excluded.joined_at),
      updated_at = timezone('utc', now())
  returning * into membership;

  return membership;
end;
$$;

create or replace function public.sync_post_reaction_counts()
returns trigger
language plpgsql
as $$
declare
  target_party_id uuid;
begin
  select p.party_id into target_party_id
  from public.posts p
  where p.id = coalesce(new.post_id, old.post_id);

  if tg_op = 'INSERT' then
    if new.reaction = 'like' then
      update public.posts set like_count = like_count + 1, updated_at = timezone('utc', now()) where id = new.post_id;
    else
      update public.posts set dislike_count = dislike_count + 1, updated_at = timezone('utc', now()) where id = new.post_id;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.reaction <> new.reaction then
      if old.reaction = 'like' then
        update public.posts set like_count = greatest(like_count - 1, 0), updated_at = timezone('utc', now()) where id = new.post_id;
      else
        update public.posts set dislike_count = greatest(dislike_count - 1, 0), updated_at = timezone('utc', now()) where id = new.post_id;
      end if;

      if new.reaction = 'like' then
        update public.posts set like_count = like_count + 1, updated_at = timezone('utc', now()) where id = new.post_id;
      else
        update public.posts set dislike_count = dislike_count + 1, updated_at = timezone('utc', now()) where id = new.post_id;
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.reaction = 'like' then
      update public.posts set like_count = greatest(like_count - 1, 0), updated_at = timezone('utc', now()) where id = old.post_id;
    else
      update public.posts set dislike_count = greatest(dislike_count - 1, 0), updated_at = timezone('utc', now()) where id = old.post_id;
    end if;
    return old;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.sync_comment_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set comment_count = comment_count + 1,
        updated_at = timezone('utc', now())
    where id = new.post_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.posts
    set comment_count = greatest(comment_count - 1, 0),
        updated_at = timezone('utc', now())
    where id = old.post_id;
    return old;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.update_checkin_streak()
returns trigger
language plpgsql
as $$
declare
  previous_checkin date;
  previous_streak integer;
begin
  select p.last_checkin_at::date, p.streak_days
  into previous_checkin, previous_streak
  from public.profiles p
  where p.id = new.user_id;

  if previous_checkin = new.checkin_date then
    raise exception 'check-in already registered for this day';
  end if;

  update public.profiles
  set streak_days = case
        when previous_checkin = new.checkin_date - 1 then coalesce(previous_streak, 0) + 1
        else 1
      end,
      last_checkin_at = new.checkin_date::timestamptz,
      updated_at = timezone('utc', now())
  where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_parties_updated_at on public.parties;
create trigger trg_parties_updated_at
before update on public.parties
for each row execute function public.set_updated_at();

drop trigger if exists trg_party_members_updated_at on public.party_members;
create trigger trg_party_members_updated_at
before update on public.party_members
for each row execute function public.set_updated_at();

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_post_reactions_updated_at on public.post_reactions;
create trigger trg_post_reactions_updated_at
before update on public.post_reactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists trg_party_join_requests_updated_at on public.party_join_requests;
create trigger trg_party_join_requests_updated_at
before update on public.party_join_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists trg_party_owner_membership on public.parties;
create trigger trg_party_owner_membership
after insert on public.parties
for each row execute function public.create_party_owner_membership();

drop trigger if exists trg_profiles_prevent_email_change on public.profiles;
create trigger trg_profiles_prevent_email_change
before update on public.profiles
for each row execute function public.prevent_profile_email_change();

drop trigger if exists trg_party_member_owner_sync on public.party_members;
create trigger trg_party_member_owner_sync
after insert or update on public.party_members
for each row execute function public.sync_party_member_owner();

drop trigger if exists trg_post_reactions_counts on public.post_reactions;
create trigger trg_post_reactions_counts
after insert or update or delete on public.post_reactions
for each row execute function public.sync_post_reaction_counts();

drop trigger if exists trg_comments_count on public.comments;
create trigger trg_comments_count
after insert or delete on public.comments
for each row execute function public.sync_comment_count();

drop trigger if exists trg_checkins_update_streak on public.checkins;
create trigger trg_checkins_update_streak
after insert on public.checkins
for each row execute function public.update_checkin_streak();

alter table public.profiles enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.party_favorites enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;
alter table public.checkins enable row level security;
alter table public.party_join_requests enable row level security;

drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "parties_read_members" on public.parties;
create policy "parties_read_members"
on public.parties
for select
to authenticated
using (auth.uid() = owner_id or public.is_party_member(id));

drop policy if exists "parties_insert_authenticated" on public.parties;
create policy "parties_insert_authenticated"
on public.parties
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "parties_update_owner_admin" on public.parties;
create policy "parties_update_owner_admin"
on public.parties
for update
to authenticated
using (public.is_party_admin(id))
with check (public.is_party_admin(id));

drop policy if exists "parties_delete_owner" on public.parties;
create policy "parties_delete_owner"
on public.parties
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "party_members_read_members" on public.party_members;
create policy "party_members_read_members"
on public.party_members
for select
to authenticated
using (public.is_party_member(party_id));

drop policy if exists "party_members_manage_admins" on public.party_members;
create policy "party_members_manage_admins"
on public.party_members
for insert
to authenticated
with check (public.is_party_admin(party_id));

drop policy if exists "party_members_update_admins" on public.party_members;
create policy "party_members_update_admins"
on public.party_members
for update
to authenticated
using (public.is_party_admin(party_id))
with check (public.is_party_admin(party_id));

drop policy if exists "party_members_delete_admins_or_self" on public.party_members;
create policy "party_members_delete_admins_or_self"
on public.party_members
for delete
to authenticated
using (public.is_party_admin(party_id) or auth.uid() = user_id);

drop policy if exists "party_favorites_self_only" on public.party_favorites;
create policy "party_favorites_self_only"
on public.party_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "party_favorites_insert_self" on public.party_favorites;
create policy "party_favorites_insert_self"
on public.party_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "party_favorites_delete_self" on public.party_favorites;
create policy "party_favorites_delete_self"
on public.party_favorites
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "posts_read_party_members" on public.posts;
create policy "posts_read_party_members"
on public.posts
for select
to authenticated
using (public.is_party_member(party_id) and deleted_at is null);

drop policy if exists "posts_insert_party_members" on public.posts;
create policy "posts_insert_party_members"
on public.posts
for insert
to authenticated
with check (public.is_party_member(party_id) and auth.uid() = author_id);

drop policy if exists "posts_update_author_or_admin" on public.posts;
create policy "posts_update_author_or_admin"
on public.posts
for update
to authenticated
using (auth.uid() = author_id or public.is_party_admin(party_id))
with check (auth.uid() = author_id or public.is_party_admin(party_id));

drop policy if exists "posts_delete_author_or_admin" on public.posts;
create policy "posts_delete_author_or_admin"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id or public.is_party_admin(party_id));

drop policy if exists "post_reactions_read_party_members" on public.post_reactions;
create policy "post_reactions_read_party_members"
on public.post_reactions
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_reactions.post_id
      and public.is_party_member(p.party_id)
  )
);

drop policy if exists "post_reactions_write_party_members" on public.post_reactions;
create policy "post_reactions_write_party_members"
on public.post_reactions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.posts p
    where p.id = post_reactions.post_id
      and public.is_party_member(p.party_id)
  )
);

drop policy if exists "post_reactions_update_self" on public.post_reactions;
create policy "post_reactions_update_self"
on public.post_reactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "post_reactions_delete_self" on public.post_reactions;
create policy "post_reactions_delete_self"
on public.post_reactions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "comments_read_party_members" on public.comments;
create policy "comments_read_party_members"
on public.comments
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and public.is_party_member(p.party_id)
  )
  and deleted_at is null
);

drop policy if exists "comments_insert_party_members" on public.comments;
create policy "comments_insert_party_members"
on public.comments
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and public.is_party_member(p.party_id)
  )
);

drop policy if exists "comments_update_author_or_admin" on public.comments;
create policy "comments_update_author_or_admin"
on public.comments
for update
to authenticated
using (
  auth.uid() = author_id
  or exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and public.is_party_admin(p.party_id)
  )
)
with check (
  auth.uid() = author_id
  or exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and public.is_party_admin(p.party_id)
  )
);

drop policy if exists "comments_delete_author_or_admin" on public.comments;
create policy "comments_delete_author_or_admin"
on public.comments
for delete
to authenticated
using (
  auth.uid() = author_id
  or exists (
    select 1
    from public.posts p
    where p.id = comments.post_id
      and public.is_party_admin(p.party_id)
  )
);

drop policy if exists "checkins_self_only_read" on public.checkins;
create policy "checkins_self_only_read"
on public.checkins
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "checkins_self_only_write" on public.checkins;
create policy "checkins_self_only_write"
on public.checkins
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "checkins_self_only_delete" on public.checkins;
create policy "checkins_self_only_delete"
on public.checkins
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "party_join_requests_read_self_or_admin" on public.party_join_requests;
create policy "party_join_requests_read_self_or_admin"
on public.party_join_requests
for select
to authenticated
using (auth.uid() = user_id or public.is_party_admin(party_id));

drop policy if exists "party_join_requests_insert_self" on public.party_join_requests;
create policy "party_join_requests_insert_self"
on public.party_join_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "party_join_requests_update_admin" on public.party_join_requests;
create policy "party_join_requests_update_admin"
on public.party_join_requests
for update
to authenticated
using (public.is_party_admin(party_id))
with check (public.is_party_admin(party_id));

drop policy if exists "party_join_requests_delete_self_or_admin" on public.party_join_requests;
create policy "party_join_requests_delete_self_or_admin"
on public.party_join_requests
for delete
to authenticated
using (auth.uid() = user_id or public.is_party_admin(party_id));

insert into storage.buckets (id, name, public)
values
  ('profile-avatars', 'profile-avatars', true),
  ('profile-banners', 'profile-banners', true),
  ('party-avatars', 'party-avatars', true),
  ('party-banners', 'party-banners', true),
  ('post-media', 'post-media', true)
on conflict (id) do nothing;

drop policy if exists "storage_read_public_profile_avatars" on storage.objects;
create policy "storage_read_public_profile_avatars"
on storage.objects
for select
to public
using (bucket_id = 'profile-avatars');

drop policy if exists "storage_read_public_profile_banners" on storage.objects;
create policy "storage_read_public_profile_banners"
on storage.objects
for select
to public
using (bucket_id = 'profile-banners');

drop policy if exists "storage_read_public_party_avatars" on storage.objects;
create policy "storage_read_public_party_avatars"
on storage.objects
for select
to public
using (bucket_id = 'party-avatars');

drop policy if exists "storage_read_public_party_banners" on storage.objects;
create policy "storage_read_public_party_banners"
on storage.objects
for select
to public
using (bucket_id = 'party-banners');

drop policy if exists "storage_read_public_post_media" on storage.objects;
create policy "storage_read_public_post_media"
on storage.objects
for select
to public
using (bucket_id = 'post-media');

drop policy if exists "storage_insert_authenticated_profile_avatars" on storage.objects;
create policy "storage_insert_authenticated_profile_avatars"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-avatars' and owner_id = auth.uid()::text);

drop policy if exists "storage_insert_authenticated_profile_banners" on storage.objects;
create policy "storage_insert_authenticated_profile_banners"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-banners' and owner_id = auth.uid()::text);

drop policy if exists "storage_insert_authenticated_party_avatars" on storage.objects;
create policy "storage_insert_authenticated_party_avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'party-avatars'
  and (select public.is_party_admin((storage.foldername(name))[1]::uuid))
);

drop policy if exists "storage_insert_authenticated_party_banners" on storage.objects;
create policy "storage_insert_authenticated_party_banners"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'party-banners'
  and (select public.is_party_admin((storage.foldername(name))[1]::uuid))
);

drop policy if exists "storage_insert_authenticated_post_media" on storage.objects;
create policy "storage_insert_authenticated_post_media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'post-media' and owner_id = auth.uid()::text);

drop policy if exists "storage_update_own_objects" on storage.objects;
create policy "storage_update_own_objects"
on storage.objects
for update
to authenticated
using (owner_id = auth.uid()::text)
with check (owner_id = auth.uid()::text);

drop policy if exists "storage_delete_own_objects" on storage.objects;
create policy "storage_delete_own_objects"
on storage.objects
for delete
to authenticated
using (owner_id = auth.uid()::text);

commit;
