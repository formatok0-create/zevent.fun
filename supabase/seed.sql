-- ════════════════════════════════════════════════════════════════
-- ZEVENT — DONNÉES DE DÉMONSTRATION (facultatif)
--
-- Remplacez l'UUID ci-dessous par celui de votre utilisateur
-- (Authentication → Users dans le tableau de bord Supabase),
-- puis exécutez ce fichier.
--
-- POUR TOUT SUPPRIMER : exécutez la dernière requête du fichier.
-- ════════════════════════════════════════════════════════════════

do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000000'; -- ← à remplacer
  aicha uuid;
begin
  if not exists (select 1 from auth.users where id = demo_user) then
    raise notice 'Utilisateur introuvable : renseignez demo_user avant de rejouer ce fichier.';
    return;
  end if;

  insert into public.invitations (
    user_id, type, template_id, slug, title, groom_name, bride_name,
    wedding_date, wedding_time, venue, address, description, story,
    program, status, published_at
  ) values (
    demo_user, 'musulman', 'nuit-de-henne', 'aicha-et-yassine', 'Aïcha & Yassine',
    'Yassine', 'Aïcha', date '2026-12-12', time '16:00',
    'Palais de la Culture', 'Boulevard Valéry Giscard d''Estaing, Treichville, Abidjan',
    'Nous serions honorés de votre présence pour célébrer notre union, entourés de nos familles.',
    'Nous nous sommes croisés un mardi de juillet, dans la file d''une librairie de Cocody. Yassine tenait un recueil de Senghor, Aïcha attendait son thé. Trois ans plus tard, la même impatience, la même file, et une promesse.',
    '[{"time":"16h00","title":"Cérémonie","note":"Palais de la Culture"},
      {"time":"18h30","title":"Cocktail","note":"Jardin sud"},
      {"time":"21h00","title":"Dîner et soirée"}]'::jsonb,
    'published', now() - interval '12 days'
  )
  on conflict (slug) do nothing
  returning id into aicha;

  insert into public.invitations (
    user_id, type, template_id, title, groom_name, bride_name,
    wedding_date, wedding_time, venue, address, description, status
  ) values (
    demo_user, 'chretien', 'cathedrale', 'Emma & Nathan',
    'Nathan', 'Emma', date '2027-04-18', time '14:30',
    'Domaine de la Roseraie', 'Route des Vignes, Aix-en-Provence',
    'Une journée simple, en plein air, avec ceux que nous aimons.',
    'draft'
  );

  if aicha is not null then
    insert into public.invitation_history (invitation_id, user_id, action, metadata, created_at)
    values
      (aicha, demo_user, 'invitation.created',   '{"title":"Aïcha & Yassine"}'::jsonb, now() - interval '46 days'),
      (aicha, demo_user, 'invitation.updated',   '{"fields":["story"]}'::jsonb,        now() - interval '30 days'),
      (aicha, demo_user, 'invitation.published', '{"slug":"aicha-et-yassine"}'::jsonb, now() - interval '12 days');
  end if;
end $$;

-- ── Suppression des données de démonstration ────────────────────
-- delete from public.invitations
-- where slug = 'aicha-et-yassine' or title = 'Emma & Nathan';
