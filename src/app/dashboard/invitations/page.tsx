import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { Reveal } from "@/components/motion/reveal";
import { requireUser } from "@/lib/services/session";
import { listInvitations } from "@/lib/services/invitations";

export const metadata: Metadata = { title: "Mes invitations" };

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "published", label: "En ligne" },
  { key: "draft", label: "Brouillons" },
] as const;

const PRODUITS = [
  { key: "mariage", label: "Mariages" },
  { key: "anniversaire", label: "Anniversaires" },
] as const;

/* La pastille de filtre. `zv-maison` la fait parler la voix de la
   maison, comme les boutons. */
const PASTILLE =
  "zv-maison inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.7rem] font-semibold uppercase transition-colors duration-400 ease-silk sm:px-5";

/* Le compte : une gelule dans la pastille, jamais un chiffre nu. */
const GELULE =
  "tabular rounded-full bg-ivory-deep px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-ink-faint";
const GELULE_ACTIVE =
  "tabular rounded-full bg-white/20 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-white";

/** Les deux filtres cohabitent dans l'URL sans s'ecraser. */
function buildHref({ statut, produit }: { statut?: string; produit?: string }): string {
  const params = new URLSearchParams();
  if (statut && statut !== "all") params.set("statut", statut);
  if (produit) params.set("produit", produit);
  const query = params.toString();
  return query ? `/dashboard/invitations?${query}` : "/dashboard/invitations";
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; produit?: string }>;
}) {
  const user = await requireUser();
  const { statut, produit } = await searchParams;
  const everything = await listInvitations(user.id);

  /* Deux produits, deux façons de trier : par statut et par nature.
     Les deux filtres se combinent dans l'URL. */
  const all =
    produit === "mariage" || produit === "anniversaire"
      ? everything.filter((i) => (i.product ?? "mariage") === produit)
      : everything;

  const filtered =
    statut === "published"
      ? all.filter((i) => i.status === "published")
      : statut === "draft"
        ? all.filter((i) => i.status !== "published")
        : all;

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Votre collection"
        title={<>Mes <span className="italic">invitations</span></>}
        description="Chaque invitation vit ici jusqu’à sa publication — et bien après."
        action={<ButtonLink href="/dashboard/invitations/new">+ Créer une invitation</ButtonLink>}
      />

      {all.length === 0 ? (
        <EmptyState
          eyebrow="Rien pour l’instant"
          title="Votre histoire commence ici."
          description="Créez votre première invitation : vous pourrez la modifier autant de fois que nécessaire avant de la publier."
          action={<ButtonLink href="/dashboard/invitations/new">Créer ma première invitation</ButtonLink>}
        />
      ) : (
        <>
          {/* Les filtres etaient des mots poses cote a cote : rien ne
              disait qu'on pouvait appuyer dessus, et le filtre actif
              se reconnaissait a une nuance de gris. Ce sont des
              pastilles — pleines quand elles sont actives, cerclees
              sinon — avec le compte dans une gelule a part. */}
          <nav
            aria-label="Filtrer"
            className="mb-10 flex flex-wrap items-center gap-2 border-y border-line py-4 sm:gap-2.5"
          >
            {FILTERS.map((filter) => {
              const active = (statut ?? "all") === filter.key;
              /* Le compte doit dire ce qu'on obtiendra en cliquant, donc
                 tenir compte du filtre produit en cours. Sinon la
                 pastille annonce « Mariages 3 » alors que « Brouillons »
                 est actif et qu'aucun mariage n'est en brouillon — on
                 clique sur un 3 et on tombe sur une page vide. */
              const count =
                filter.key === "all"
                  ? all.length
                  : filter.key === "published"
                    ? all.filter((i) => i.status === "published").length
                    : all.filter((i) => i.status !== "published").length;
              return (
                <a
                  key={filter.key}
                  href={buildHref({ statut: filter.key === "all" ? undefined : filter.key, produit })}
                  aria-current={active ? "true" : undefined}
                  className={`${PASTILLE} ${
                    active
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {filter.label}
                  <span className={active ? GELULE_ACTIVE : GELULE}>{count}</span>
                </a>
              );
            })}

            <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />

            {PRODUITS.map((entry) => {
              const active = produit === entry.key;
              /* Même règle en sens inverse : on compte dans le statut
                 en cours, pas dans la totalité. */
              const parStatut =
                statut === "published"
                  ? everything.filter((i) => i.status === "published")
                  : statut === "draft"
                    ? everything.filter((i) => i.status !== "published")
                    : everything;
              const count = parStatut.filter((i) => (i.product ?? "mariage") === entry.key).length;
              /* On garde la pastille même à zéro : la faire disparaître
                 selon le filtre ferait sauter les boutons d'une vue à
                 l'autre. */
              const jamais = everything.every((i) => (i.product ?? "mariage") !== entry.key);
              if (jamais) return null;
              /* La pastille anniversaire porte sa propre couleur : on
                 doit distinguer les deux produits d'un coup d'oeil.
                 Les classes sont ecrites en toutes lettres — Tailwind
                 lit le fichier source, il ne resout pas `bg-${x}`. */
              const teinte =
                entry.key === "anniversaire"
                  ? "border-nuit-fete bg-nuit-fete text-white"
                  : "border-gold bg-gold text-white";
              return (
                <a
                  key={entry.key}
                  href={buildHref({ statut, produit: active ? undefined : entry.key })}
                  aria-current={active ? "true" : undefined}
                  className={`${PASTILLE} ${
                    active
                      ? teinte
                      : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {entry.label}
                  <span className={active ? GELULE_ACTIVE : GELULE}>{count}</span>
                </a>
              );
            })}
          </nav>

          {filtered.length === 0 ? (
            /* Une vue vide alors que le compte n'est pas vide vient
               presque toujours du croisement des deux filtres. On le dit,
               et on offre la sortie. */
            <div className="grid justify-items-center gap-4 border-t border-line py-16 text-center">
              <p className="text-sm font-light text-ink-soft">
                {everything.length === 0
                  ? "Aucune invitation dans cette vue pour le moment."
                  : "Aucune invitation ne correspond à ces deux filtres ensemble."}
              </p>
              {everything.length > 0 && (
                <a
                  href="/dashboard/invitations"
                  className="zv-maison inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-[0.7rem] font-semibold uppercase text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Tout afficher
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((invitation, index) => (
                <Reveal key={invitation.id} delay={index * 0.05}>
                  <InvitationCard invitation={invitation} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </PageFrame>
  );
}
