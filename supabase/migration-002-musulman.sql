-- ════════════════════════════════════════════════════════════════
-- MIGRATION 002 — STRUCTURE DU MARIAGE MUSULMAN
-- À exécuter dans le SQL Editor après schema.sql.
-- Idempotent : peut être rejoué sans risque.
-- ════════════════════════════════════════════════════════════════

alter table public.invitations
  add column if not exists bride_family     text,
  add column if not exists groom_family     text,
  add column if not exists bride_photo_url  text,
  add column if not exists groom_photo_url  text,
  add column if not exists events           jsonb;

comment on column public.invitations.events is
  'Tableau des cérémonies : [{kind:"civil"|"religieux"|"walima", date, time, venue, address}]. L''ordre d''affichage est recalculé selon date + heure.';

comment on column public.invitations.bride_family is
  'Nom de la famille de la mariée, utilisé pour composer le message d''invitation.';

-- Nouveau bucket : les portraits des deux mariés.
insert into storage.buckets (id, name, public)
values ('invitation-portraits', 'invitation-portraits', true)
on conflict (id) do nothing;

drop policy if exists "storage: lecture publique zevent" on storage.objects;
create policy "storage: lecture publique zevent" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('invitation-covers','invitation-gallery','invitation-portraits','invitation-music','avatars'));

drop policy if exists "storage: envoi par le propriétaire" on storage.objects;
create policy "storage: envoi par le propriétaire" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('invitation-covers','invitation-gallery','invitation-portraits','invitation-music','avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage: suppression par le propriétaire" on storage.objects;
create policy "storage: suppression par le propriétaire" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('invitation-covers','invitation-gallery','invitation-portraits','invitation-music','avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
