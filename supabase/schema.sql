-- ════════════════════════════════════════════════════════════════
-- ZEVENT — SCHEMA SUPABASE
-- À exécuter dans le SQL Editor d'un projet Supabase neuf.
-- Idempotent : peut être rejoué sans casse.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Types ───────────────────────────────────────────────────────

do $$ begin
  create type wedding_type as enum ('chretien', 'musulman');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invitation_status as enum ('draft', 'published', 'unpublished');
exception when duplicate_object then null; end $$;

-- ── profiles ────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  first_name  text,
  last_name   text,
  avatar_url  text,
  locale      text not null default 'fr',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── invitations ─────────────────────────────────────────────────

create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  type            wedding_type not null,
  template_id     text not null default 'ivoire',
  slug            text unique,
  title           text,
  groom_name      text not null,
  bride_name      text not null,
  wedding_date    date,
  wedding_time    time,
  venue           text,
  address         text,
  description     text,
  story           text,
  music_url       text,
  music_title     text,
  cover_image_url text,
  program         jsonb,
  status          invitation_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz,

  constraint slug_format check (
    slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint slug_length check (slug is null or char_length(slug) between 3 and 64),
  constraint published_needs_slug check (status <> 'published' or slug is not null)
);

create index if not exists invitations_user_idx on public.invitations (user_id, updated_at desc);
create index if not exists invitations_slug_idx on public.invitations (slug) where status = 'published';

-- ── invitation_photos ───────────────────────────────────────────

create table if not exists public.invitation_photos (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  url           text not null,
  caption       text,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists photos_invitation_idx
  on public.invitation_photos (invitation_id, position);

-- ── invitation_history ──────────────────────────────────────────

create table if not exists public.invitation_history (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations (id) on delete set null,
  user_id       uuid not null references auth.users (id) on delete cascade,
  action        text not null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists history_user_idx on public.invitation_history (user_id, created_at desc);

-- ════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════════════

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists invitations_touch on public.invitations;
create trigger invitations_touch before update on public.invitations
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Un profil est créé automatiquement à l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, first_name, last_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Horodatage de publication.
create or replace function public.stamp_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists invitations_publish_stamp on public.invitations;
create trigger invitations_publish_stamp before update on public.invitations
  for each row execute function public.stamp_published_at();

-- Suppression du compte par l'utilisateur lui-même (cascade complète).
create or replace function public.delete_own_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();
end $$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Règle : chacun ne voit que ses données. Seules les invitations
-- publiées sont lisibles publiquement, et uniquement en lecture.
-- ════════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.invitations        enable row level security;
alter table public.invitation_photos  enable row level security;
alter table public.invitation_history enable row level security;

-- profiles
drop policy if exists "profiles: lecture par le propriétaire" on public.profiles;
create policy "profiles: lecture par le propriétaire" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles: création par le propriétaire" on public.profiles;
create policy "profiles: création par le propriétaire" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles: mise à jour par le propriétaire" on public.profiles;
create policy "profiles: mise à jour par le propriétaire" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- invitations
drop policy if exists "invitations: lecture par le propriétaire" on public.invitations;
create policy "invitations: lecture par le propriétaire" on public.invitations
  for select using (auth.uid() = user_id);

drop policy if exists "invitations: lecture publique si publiée" on public.invitations;
create policy "invitations: lecture publique si publiée" on public.invitations
  for select to anon, authenticated using (status = 'published');

drop policy if exists "invitations: création par le propriétaire" on public.invitations;
create policy "invitations: création par le propriétaire" on public.invitations
  for insert with check (auth.uid() = user_id);

drop policy if exists "invitations: mise à jour par le propriétaire" on public.invitations;
create policy "invitations: mise à jour par le propriétaire" on public.invitations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "invitations: suppression par le propriétaire" on public.invitations;
create policy "invitations: suppression par le propriétaire" on public.invitations
  for delete using (auth.uid() = user_id);

-- invitation_photos : suivent le sort de leur invitation
drop policy if exists "photos: lecture" on public.invitation_photos;
create policy "photos: lecture" on public.invitation_photos
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (i.user_id = auth.uid() or i.status = 'published')
    )
  );

drop policy if exists "photos: écriture par le propriétaire" on public.invitation_photos;
create policy "photos: écriture par le propriétaire" on public.invitation_photos
  for all using (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.user_id = auth.uid())
  );

-- invitation_history : privé, non modifiable après coup
drop policy if exists "historique: lecture par le propriétaire" on public.invitation_history;
create policy "historique: lecture par le propriétaire" on public.invitation_history
  for select using (auth.uid() = user_id);

drop policy if exists "historique: écriture par le propriétaire" on public.invitation_history;
create policy "historique: écriture par le propriétaire" on public.invitation_history
  for insert with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════
-- STORAGE
-- ════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('invitation-covers',  'invitation-covers',  true),
  ('invitation-gallery', 'invitation-gallery', true),
  ('invitation-music',   'invitation-music',   true),
  ('avatars',            'avatars',            true)
on conflict (id) do nothing;

-- Lecture publique : les invités doivent voir les images.
drop policy if exists "storage: lecture publique zevent" on storage.objects;
create policy "storage: lecture publique zevent" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('invitation-covers', 'invitation-gallery', 'invitation-music', 'avatars'));

-- Écriture : chaque fichier vit dans un dossier au nom de l'utilisateur.
drop policy if exists "storage: envoi par le propriétaire" on storage.objects;
create policy "storage: envoi par le propriétaire" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('invitation-covers', 'invitation-gallery', 'invitation-music', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage: suppression par le propriétaire" on storage.objects;
create policy "storage: suppression par le propriétaire" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('invitation-covers', 'invitation-gallery', 'invitation-music', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
