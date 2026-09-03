import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageFrame } from "@/components/dashboard/page-frame";
import { isSupabaseConfigured } from "@/lib/config";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { Reveal } from "@/components/motion/reveal";
import { requireUser, displayName } from "@/lib/services/session";
import { listInvitations } from "@/lib/services/invitations";
import { listHistory, HISTORY_LABELS } from "@/lib/services/history";
import { formatRelative } from "@/lib/utils/date";

export default async function DashboardHome() {
  const user = await requireUser();
  const [invitations, history] = await Promise.all([
    listInvitations(user.id),
    listHistory(user.id, 4),
  ]);

  const [featured, ...others] = invitations;

  /* Deux produits sous le meme toit : on separe le reste en deux
     rangees plutot que de melanger mariages et anniversaires. */
  const productOf = (invitation: (typeof invitations)[number]) => invitation.product ?? "mariage";
  const GROUPS = [
    { key: "mariage" as const, label: "Vos mariages", accent: "text-gold" },
    { key: "anniversaire" as const, label: "Vos anniversaires", accent: "text-flamme" },
  ].map((group) => ({ ...group, items: others.filter((i) => productOf(i) === group.key) }));

  return (
    <PageFrame>
      {/* Sans variables d'environnement Supabase, l'application tourne
          sur un magasin en memoire : tout disparait au redemarrage du
          serveur, et sur Vercel a chaque instance. C'est la cause la
          plus frequente d'une invitation « qui ne vit pas longtemps »,
          et rien ne le disait a l'ecran. */}
      {!isSupabaseConfigured && (
        <div className="mb-12 border border-burgundy/25 bg-burgundy/5 px-6 py-5">
          <p className="eyebrow-sm text-burgundy">Mode démonstration</p>
          <p className="mt-3 max-w-2xl text-sm font-light leading-[1.8] text-ink-soft">
            Aucune base n’est connectée : vos invitations vivent en mémoire et
            disparaissent au redémarrage du serveur. Renseignez les variables
            Supabase et jouez les migrations pour qu’elles soient conservées.
          </p>
        </div>
      )}

      <Reveal>
        <header className="flex flex-col gap-9 pb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-gold">Bonjour, {displayName(user)}</p>
            <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.2rem,5.5vw,3.75rem)] leading-[1.02]">
              Créons quelque chose
              <br />
              <span className="italic">de mémorable.</span>
            </h1>
          </div>
          <ButtonLink href="/dashboard/invitations/new" size="lg">
            + Créer une invitation
          </ButtonLink>
        </header>
      </Reveal>

      {invitations.length === 0 ? (
        <EmptyState
          eyebrow="Votre espace est prêt"
          title="Votre histoire commence ici."
          description="Vous n’avez encore aucune invitation. Un mariage ou un anniversaire : quelques prénoms, une date, et le reste peut attendre."
          action={<ButtonLink href="/dashboard/invitations/new">Créer ma première invitation</ButtonLink>}
        />
      ) : (
        <div className="space-y-20">
          <section aria-labelledby="principale">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 id="principale" className="eyebrow text-ink-soft">L’invitation du moment</h2>
              <span className="eyebrow-sm text-ink-faint">La plus récemment modifiée</span>
            </div>
            <Reveal>
              <InvitationCard invitation={featured} featured />
            </Reveal>
          </section>

          {GROUPS.map((group) =>
            group.items.length === 0 ? null : (
              <section key={group.key} aria-labelledby={group.key}>
                <div className="mb-8 flex items-baseline justify-between gap-4">
                  <h2 id={group.key} className={`eyebrow ${group.accent}`}>
                    {group.label}
                  </h2>
                  <span className="eyebrow-sm text-ink-faint">{group.items.length}</span>
                </div>
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((invitation, index) => (
                    <Reveal key={invitation.id} delay={index * 0.06}>
                      <InvitationCard invitation={invitation} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ),
          )}

          {history.length > 0 && (
            <section aria-labelledby="mouvements">
              <div className="mb-8 flex items-baseline justify-between gap-4">
                <h2 id="mouvements" className="eyebrow text-ink-soft">Derniers mouvements</h2>
                <ButtonLink href="/dashboard/history" variant="ghost" size="sm">
                  Tout l’historique
                </ButtonLink>
              </div>
              <ul>
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line py-4"
                  >
                    <p className="text-sm font-light text-ink">
                      {HISTORY_LABELS[entry.action]?.title ?? "Action"}
                      {entry.invitationTitle && (
                        <span className="text-ink-faint"> — {entry.invitationTitle}</span>
                      )}
                    </p>
                    <p className="eyebrow-sm text-ink-faint">{formatRelative(entry.created_at)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </PageFrame>
  );
}
