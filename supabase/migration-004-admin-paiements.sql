-- ════════════════════════════════════════════════════════════════
-- ZEVENT — MIGRATION 004 : ADMINISTRATION ET PAIEMENTS
-- À jouer APRÈS schema.sql, 002 et 003. Idempotent.
--
-- Trois ajouts : un rôle et un statut sur les profils, les réglages
-- des deux fournisseurs de paiement, les tarifs et les paiements.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Types ───────────────────────────────────────────────────────

do $$ begin create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin create type user_status as enum ('active', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin create type payment_provider as enum ('saspay', 'chariow');
exception when duplicate_object then null; end $$;

do $$ begin create type payment_environment as enum ('test', 'live');
exception when duplicate_object then null; end $$;

do $$ begin create type payment_status as enum ('pending', 'success', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── profiles : rôle et statut ───────────────────────────────────

alter table public.profiles
  add column if not exists role         user_role   not null default 'user',
  add column if not exists status       user_status not null default 'active',
  add column if not exists blocked_at   timestamptz,
  add column if not exists blocked_reason text,
  add column if not exists last_seen_at timestamptz;

-- Un administrateur se reconnaît sans relire la table des profils
-- depuis chaque politique : sinon chaque politique déclencherait sa
-- propre lecture de `profiles`, laquelle rappellerait la politique.
-- `security definer` coupe cette récursion.
create or replace function public.est_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = uid and role = 'admin' and status = 'active'
  );
$$;

-- ── payment_settings : une ligne par fournisseur ────────────────

create table if not exists public.payment_settings (
  provider        payment_provider primary key,
  enabled         boolean not null default false,
  environment     payment_environment not null default 'test',
  api_key         text,
  webhook_secret  text,
  product_id      text,
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users (id) on delete set null
);

insert into public.payment_settings (provider) values ('saspay'), ('chariow')
on conflict (provider) do nothing;

-- ── plans : les tarifs, éditables depuis l'administration ───────

create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text,
  -- En unité entière de la devise : 5000 XOF, pas 50.00. Le franc CFA
  -- n'a pas de centimes, et un entier évite les arrondis flottants.
  amount      integer not null default 0 check (amount >= 0),
  currency    text not null default 'XOF',
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Le mariage a un prix unique. L'anniversaire, non : les collections
-- et le soin ne sont pas les mêmes à sept ans qu'à trente, et le code
-- de chaque tarif reprend la tranche d'âge du parcours.
insert into public.plans (code, name, description, amount, currency, sort_order) values
  ('mariage',                'Invitation mariage',        'Une invitation de mariage, dix collections, lien à vie.', 5000, 'XOF', 1),
  ('anniversaire-enfant',    'Anniversaire · 1 à 10 ans', 'Huit collections : champignons, licornes, éclairs, arcs-en-ciel.', 3500,  'XOF', 10),
  ('anniversaire-jeune-ado', 'Anniversaire · 11 à 14 ans','Arène, Voltage, Nuit bleue — le même soin, en plus moderne.',       4000,  'XOF', 11),
  ('anniversaire-ado',       'Anniversaire · 15 à 17 ans','Velours rose, Bitume, Perle.',                                      4500, 'XOF', 12),
  ('anniversaire-adulte',    'Anniversaire · 18 ans et +','Smoking, Rubis, Château — la fête des grands.',                     5000, 'XOF', 13)
on conflict (code) do nothing;

-- Si une version antérieure de cette migration avait posé un tarif
-- anniversaire unique, il n'a plus de sens : les quatre tranches l'ont
-- remplacé. On le retire s'il n'a jamais servi à un paiement.
delete from public.plans
where code = 'anniversaire'
  and not exists (select 1 from public.payments where plan_id = plans.id);

-- ── payments ────────────────────────────────────────────────────

create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete set null,
  invitation_id      uuid references public.invitations (id) on delete set null,
  plan_id            uuid references public.plans (id) on delete set null,
  provider           payment_provider not null,
  provider_reference text,
  status             payment_status not null default 'pending',
  amount             integer not null default 0,
  currency           text not null default 'XOF',
  checkout_url       text,
  -- Clé de déduplication des webhooks : `x-pulse-delivery-id` chez
  -- Chariow, l'identifiant de transaction chez SasPay. Un même
  -- événement peut arriver cinq fois.
  last_event_id      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  paid_at            timestamptz
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create unique index if not exists payments_reference_idx
  on public.payments (provider, provider_reference)
  where provider_reference is not null;

-- ── Politiques ──────────────────────────────────────────────────

alter table public.payment_settings enable row level security;
alter table public.plans            enable row level security;
alter table public.payments         enable row level security;

drop policy if exists "réglages: administrateurs seulement" on public.payment_settings;
create policy "réglages: administrateurs seulement" on public.payment_settings
  for all using (public.est_admin(auth.uid())) with check (public.est_admin(auth.uid()));

drop policy if exists "tarifs: lecture publique des tarifs actifs" on public.plans;
create policy "tarifs: lecture publique des tarifs actifs" on public.plans
  for select using (active or public.est_admin(auth.uid()));

drop policy if exists "tarifs: écriture par les administrateurs" on public.plans;
create policy "tarifs: écriture par les administrateurs" on public.plans
  for all using (public.est_admin(auth.uid())) with check (public.est_admin(auth.uid()));

drop policy if exists "paiements: lecture par le propriétaire" on public.payments;
create policy "paiements: lecture par le propriétaire" on public.payments
  for select using (auth.uid() = user_id or public.est_admin(auth.uid()));

drop policy if exists "paiements: écriture par les administrateurs" on public.payments;
create policy "paiements: écriture par les administrateurs" on public.payments
  for all using (public.est_admin(auth.uid())) with check (public.est_admin(auth.uid()));

-- Un administrateur lit et modifie tous les profils, en plus de la
-- politique existante qui limite chacun au sien.
drop policy if exists "profiles: lecture par les administrateurs" on public.profiles;
create policy "profiles: lecture par les administrateurs" on public.profiles
  for select using (public.est_admin(auth.uid()));

drop policy if exists "profiles: écriture par les administrateurs" on public.profiles;
create policy "profiles: écriture par les administrateurs" on public.profiles
  for update using (public.est_admin(auth.uid())) with check (public.est_admin(auth.uid()));

-- Un administrateur voit toutes les invitations, pour pouvoir en
-- retirer une du public sans passer par le compte de son auteur.
drop policy if exists "invitations: lecture par les administrateurs" on public.invitations;
create policy "invitations: lecture par les administrateurs" on public.invitations
  for select using (public.est_admin(auth.uid()));

-- ── Le premier administrateur ───────────────────────────────────
-- Les politiques ci-dessus exigent qu'un administrateur existe déjà :
-- personne ne peut donc s'auto-promouvoir depuis l'application. Le
-- premier se nomme ici, une fois, avec votre adresse.
--
--   update public.profiles set role = 'admin'
--   where user_id = (select id from auth.users where email = 'vous@exemple.com');
