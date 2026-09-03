-- ════════════════════════════════════════════════════════════════
-- ZEVENT — MIGRATION 006 : UN PRODUIT CHARIOW PAR TARIF
-- À jouer après la 005. Idempotente.
--
-- Chariow ne facture pas un montant libre : il vend un produit de la
-- boutique, à son prix. Un identifiant unique au niveau du
-- fournisseur suffisait tant qu'il n'y avait qu'un tarif ; avec cinq
-- tarifs, il facturait le même prix à tout le monde — un anniversaire
-- d'enfant au tarif d'un mariage, ou l'inverse.
--
-- L'identifiant descend donc au niveau du tarif. SasPay n'est pas
-- concerné : il encaisse le montant qu'on lui donne.
-- ════════════════════════════════════════════════════════════════

alter table public.plans
  add column if not exists chariow_product_id text;

comment on column public.plans.chariow_product_id is
  'Identifiant du produit correspondant dans la boutique Chariow. '
  'Laisser vide si Chariow n''est pas utilisé pour ce tarif.';

-- Reprise : si un identifiant unique avait été saisi au niveau du
-- fournisseur, on le recopie sur le tarif du mariage — c'était le
-- seul cas où l'ancien réglage donnait un résultat juste.
update public.plans p
set chariow_product_id = s.product_id
from public.payment_settings s
where s.provider = 'chariow'
  and s.product_id is not null
  and p.code = 'mariage'
  and p.chariow_product_id is null;
