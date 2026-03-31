-- Animo Supabase schema bootstrap
-- This script is designed to be re-runnable in the Supabase SQL Editor.
-- It covers:
-- 1. Profiles
-- 2. Avatars bucket
-- 3. Communities and memberships
-- 4. Community media buckets
-- 5. Posts and likes
-- 6. Post media bucket

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  banner_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Profiles are viewable by everyone"
on public.profiles
for select
to authenticated, anon
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    user_id,
    username,
    avatar_url,
    banner_url,
    bio,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user-' || substr(new.id::text, 1, 8)),
    null,
    null,
    null,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Avatars storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload their own avatars" on storage.objects;
drop policy if exists "Authenticated users can update their own avatars" on storage.objects;

create policy "Avatar images are publicly accessible"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "Authenticated users can upload their own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can update their own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ---------------------------------------------------------------------------
-- Communities
-- ---------------------------------------------------------------------------

create table if not exists public.communities (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon_url text,
  banner_url text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  id uuid primary key,
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  unique (community_id, user_id)
);

create index if not exists communities_slug_idx on public.communities (slug);
create index if not exists communities_owner_id_idx on public.communities (owner_id);
create index if not exists community_members_community_id_idx on public.community_members (community_id);
create index if not exists community_members_user_id_idx on public.community_members (user_id);

alter table public.communities enable row level security;
alter table public.community_members enable row level security;

drop policy if exists "Communities are viewable by everyone" on public.communities;
drop policy if exists "Authenticated users can create communities" on public.communities;
drop policy if exists "Owners can update their communities" on public.communities;

create policy "Communities are viewable by everyone"
on public.communities
for select
to authenticated, anon
using (true);

create policy "Authenticated users can create communities"
on public.communities
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Owners can update their communities"
on public.communities
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Community memberships are viewable by everyone" on public.community_members;
drop policy if exists "Users can join communities as themselves" on public.community_members;
drop policy if exists "Users can leave their own memberships" on public.community_members;

create policy "Community memberships are viewable by everyone"
on public.community_members
for select
to authenticated, anon
using (true);

create policy "Users can join communities as themselves"
on public.community_members
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can leave their own memberships"
on public.community_members
for delete
to authenticated
using (auth.uid() = user_id and role <> 'owner');

-- ---------------------------------------------------------------------------
-- Community media storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('community-icons', 'community-icons', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('community-banners', 'community-banners', true)
on conflict (id) do nothing;

drop policy if exists "Community icons are public" on storage.objects;
drop policy if exists "Authenticated users can upload community icons" on storage.objects;
drop policy if exists "Authenticated users can update community icons" on storage.objects;

create policy "Community icons are public"
on storage.objects
for select
to public
using (bucket_id = 'community-icons');

create policy "Authenticated users can upload community icons"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-icons'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can update community icons"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'community-icons'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'community-icons'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Community banners are public" on storage.objects;
drop policy if exists "Authenticated users can upload community banners" on storage.objects;
drop policy if exists "Authenticated users can update community banners" on storage.objects;

create policy "Community banners are public"
on storage.objects
for select
to public
using (bucket_id = 'community-banners');

create policy "Authenticated users can upload community banners"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-banners'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can update community banners"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'community-banners'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'community-banners'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------

create table if not exists public.posts (
  id uuid primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  content text not null,
  media_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  likes_count integer not null default 0,
  comments_count integer not null default 0
);

create table if not exists public.post_likes (
  id uuid primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique (post_id, user_id)
);

drop trigger if exists posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create index if not exists posts_community_created_idx on public.posts (community_id, created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

alter table public.posts enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.posts;
drop policy if exists "Community members can create posts" on public.posts;
drop policy if exists "Authors can update their posts" on public.posts;
drop policy if exists "Authors or community owners can delete posts" on public.posts;

create policy "Posts are viewable by everyone"
on public.posts
for select
to authenticated, anon
using (true);

create policy "Community members can create posts"
on public.posts
for insert
to authenticated
with check (
  auth.uid() = author_id
  and (
    exists (
      select 1
      from public.communities c
      where c.id = community_id
        and c.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_id
        and cm.user_id = auth.uid()
    )
  )
);

create policy "Authors can update their posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "Authors or community owners can delete posts"
on public.posts
for delete
to authenticated
using (
  auth.uid() = author_id
  or exists (
    select 1
    from public.communities c
    where c.id = community_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "Post likes are viewable by everyone" on public.post_likes;
drop policy if exists "Users can like posts as themselves" on public.post_likes;
drop policy if exists "Users can unlike posts as themselves" on public.post_likes;

create policy "Post likes are viewable by everyone"
on public.post_likes
for select
to authenticated, anon
using (true);

create policy "Users can like posts as themselves"
on public.post_likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can unlike posts as themselves"
on public.post_likes
for delete
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Post media storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

drop policy if exists "Post media is public" on storage.objects;
drop policy if exists "Authenticated users can upload post media" on storage.objects;
drop policy if exists "Authenticated users can update post media" on storage.objects;

create policy "Post media is public"
on storage.objects
for select
to public
using (bucket_id = 'post-media');

create policy "Authenticated users can upload post media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Authenticated users can update post media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);
