-- ════════════════════════════════════════════════════════════════
-- ZEVENT — MIGRATION 005 : PAIEMENT ET EXPIRATION DES INVITATIONS
-- À jouer APRÈS migration-004-admin-paiements.sql. Idempotent.
--
-- Le paiement s'attache à l'INVITATION, pas à l'acte de publier :
-- payée une fois, elle reste modifiable, dépubliable et republiable
-- sans repasser à la caisse.
-- ════════════════════════════════════════════════════════════════

alter table public.invitations
  add column if not exists paid_at    timestamptz,
  add column if not exists plan_code  text,
  -- Fin du compte à rebours : passé cette date, le lien public cesse
  -- de répondre. Calculé à la publication à partir de la date de
  -- l'événement, pas au vol — une invitation dont on change la date
  -- après coup verrait sinon son échéance bouger sous les pieds.
  add column if not exists expires_at timestamptz;

create index if not exists invitations_expires_idx
  on public.invitations (expires_at)
  where status = 'published';

-- ── Les invitations déjà publiées sont acquises ─────────────────
-- Elles ont été créées quand le service était gratuit. Les faire
-- basculer en attente de paiement casserait des liens déjà envoyés
-- à des invités, pour des mariages parfois imminents.
-- « Les invitations déjà créées, on ne les touche pas. » La reprise
-- couvre donc TOUTES les lignes existantes, brouillons compris — et
-- pas seulement celles déjà publiées. Quelqu'un qui a commencé une
-- invitation hier ne doit pas se heurter à un péage aujourd'hui.
update public.invitations
set paid_at = coalesce(published_at, created_at)
where paid_at is null;

-- ── Rattacher un paiement à son invitation ──────────────────────
-- Le webhook n'a que la référence du fournisseur ; c'est la table
-- des paiements qui fait le lien vers l'invitation.
create index if not exists payments_invitation_idx
  on public.payments (invitation_id);
