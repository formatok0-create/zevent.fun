-- ════════════════════════════════════════════════════════════════
-- MIGRATION 003 — L'ANNIVERSAIRE
-- À exécuter dans le SQL Editor après migration-002-musulman.sql.
-- Idempotente : peut être rejouée sans risque.
--
-- Principe : on n'enlève rien. La table reste celle du mariage, on
-- lui ajoute un discriminant et les trois champs propres à la fête.
-- Toutes les invitations déjà en base deviennent des 'mariage' sans
-- qu'aucune valeur ne soit réécrite.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Le produit ───────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'invitation_product') then
    create type invitation_product as enum ('mariage', 'anniversaire');
  end if;
end $$;

alter table public.invitations
  add column if not exists product invitation_product not null default 'mariage';

comment on column public.invitations.product is
  'Produit auquel appartient l''invitation. Détermine les colonnes obligatoires, les templates proposés et la route publique.';

-- ── 2. Les champs de la fête ────────────────────────────────────

alter table public.invitations
  add column if not exists celebrant_name text,
  add column if not exists celebrant_age  smallint,
  add column if not exists album          jsonb not null default '[]'::jsonb;

comment on column public.invitations.celebrant_name is
  'Prénom de celui dont c''est l''anniversaire. Le pendant de bride_name / groom_name côté mariage.';

comment on column public.invitations.celebrant_age is
  'Âge fêté. C''est le chiffre affiché en grand dans le hero.';

comment on column public.invitations.album is
  'L''album des années : [{year, age, url, caption}]. Une entrée par âge, du premier anniversaire jusqu''à celui qu''on fête. L''ordre est recalculé au rendu.';

-- ── 3. Ce qui devient conditionnel ──────────────────────────────
-- Un mariage a deux prénoms et une confession ; un anniversaire n'a
-- ni l'un ni l'autre. On retire les NOT NULL de colonne et on les
-- remplace par une contrainte qui dépend du produit.

alter table public.invitations
  alter column groom_name drop not null,
  alter column bride_name drop not null,
  alter column type       drop not null;

alter table public.invitations drop constraint if exists invitation_identite;
alter table public.invitations add constraint invitation_identite check (
  (
    product = 'mariage'
    and type is not null
    and coalesce(btrim(groom_name), '') <> ''
    and coalesce(btrim(bride_name), '') <> ''
  )
  or
  (
    product = 'anniversaire'
    and coalesce(btrim(celebrant_name), '') <> ''
  )
);

alter table public.invitations drop constraint if exists celebrant_age_plausible;
alter table public.invitations add constraint celebrant_age_plausible check (
  celebrant_age is null or celebrant_age between 0 and 120
);

-- L'album doit rester un tableau : le rendu itère dessus sans filet.
alter table public.invitations drop constraint if exists album_est_un_tableau;
alter table public.invitations add constraint album_est_un_tableau check (
  jsonb_typeof(album) = 'array'
);

-- ── 4. Index ────────────────────────────────────────────────────
-- Le tableau de bord et les deux vitrines filtrent par produit.

create index if not exists invitations_product_idx
  on public.invitations (product);

create index if not exists invitations_user_product_idx
  on public.invitations (user_id, product, updated_at desc);

-- ── 5. Le stockage des photos de l'album ────────────────────────
-- Un bucket à part : ces photos ont un cycle de vie différent de la
-- galerie, on doit pouvoir remplacer une année sans toucher au reste.

insert into storage.buckets (id, name, public)
values ('invitation-album', 'invitation-album', true)
on conflict (id) do nothing;

-- Les trois politiques énumèrent les buckets : il faut les réécrire
-- en entier pour y ajouter le nouveau.

drop policy if exists "storage: lecture publique zevent" on storage.objects;
create policy "storage: lecture publique zevent" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id in (
      'invitation-covers','invitation-gallery','invitation-portraits',
      'invitation-album','invitation-music','avatars'
    )
  );

drop policy if exists "storage: envoi par le propriétaire" on storage.objects;
create policy "storage: envoi par le propriétaire" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in (
      'invitation-covers','invitation-gallery','invitation-portraits',
      'invitation-album','invitation-music','avatars'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage: suppression par le propriétaire" on storage.objects;
create policy "storage: suppression par le propriétaire" on storage.objects
  for delete to authenticated
  using (
    bucket_id in (
      'invitation-covers','invitation-gallery','invitation-portraits',
      'invitation-album','invitation-music','avatars'
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 6. Rien à changer côté RLS des invitations ──────────────────
-- Les politiques de public.invitations portent sur la ligne
-- (user_id, status), jamais sur une colonne : elles couvrent déjà
-- product, celebrant_name, celebrant_age et album.
