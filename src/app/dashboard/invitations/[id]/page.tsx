import type { Metadata } from "next";
import { publicPathFor } from "@/lib/utils/public-url";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageFrame } from "@/components/dashboard/page-frame";
import { StatusBadge } from "@/components/ui/badge";
import { InvitationActions } from "@/components/dashboard/invitation-actions";
import { InvitationExperience } from "@/templates/components/renderer";
import { Reveal } from "@/components/motion/reveal";
import { requireUser } from "@/lib/services/session";
import { getInvitation } from "@/lib/services/invitations";
import { getTemplate } from "@/templates/registry";
import { formatWeddingDateLong, formatRelative } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Aperçu de l’invitation" };

export default async function InvitationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paiement?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { paiement } = await searchParams;

  /* Le client revient de la page du prestataire. On ne le croit pas :
     on redemande l'état de la session au fournisseur, avec notre clé.
     C'est lui qui décide si l'invitation part en ligne — pas l'URL. */
  if (paiement === "retour") {
    const { verifierRetourAction } = await import("../paiement-actions");
    await verifierRetourAction(id).catch(() => false);
    /* On nettoie l'adresse : rafraîchir la page ne doit pas rejouer la
       vérification, et le paramètre n'a plus rien à dire. */
    redirect(`/dashboard/invitations/${id}`);
  }

  const invitation = await getInvitation(id, user.id);
  if (!invitation) notFound();

  const template = getTemplate(invitation.template_id);

  const isFete = (invitation.product ?? "mariage") === "anniversaire";

  const facts = [
    {
      label: isFete ? "Célébration" : "Cérémonie",
      value: isFete
        ? `Anniversaire · ${invitation.celebrant_age ?? "?"} ans`
        : invitation.type === "musulman"
          ? "Mariage musulman"
          : "Mariage chrétien",
    },
    { label: "Collection", value: template.name },
    { label: "Date", value: formatWeddingDateLong(invitation.wedding_date) },
    { label: "Heure", value: invitation.wedding_time?.slice(0, 5).replace(":", "h") ?? "—" },
    { label: "Lieu", value: invitation.venue ?? "—" },
    { label: "Photos", value: `${invitation.photos.length}` },
    { label: "Modifiée", value: formatRelative(invitation.updated_at) },
  ];

  return (
    <PageFrame>
      <Link href="/dashboard/invitations" className="eyebrow-sm link-draw text-ink-faint hover:text-ink">
        ← Mes invitations
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={invitation.status} />
            <span className="eyebrow-sm text-ink-faint">{template.name}</span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.04]">
            {invitation.bride_name} <span className="font-script italic text-gold">&amp;</span>{" "}
            {invitation.groom_name}
          </h1>
        </div>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-12">
        <aside className="min-w-0 lg:col-span-4 lg:order-2">
          <div className="lg:sticky lg:top-10">
            <InvitationActions invitation={invitation} />

            <dl className="mt-10 border-t border-line">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <dt className="eyebrow-sm text-ink-faint">{fact.label}</dt>
                  <dd className="truncate text-sm font-light text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:order-1">
          <p className="eyebrow mb-6 text-ink-soft">Aperçu</p>
          <Reveal>
            <div className="overflow-hidden rounded-sm border border-line">
              <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-3">
                <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
                <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
                <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
                <p className="eyebrow-sm ml-3 truncate text-ink-faint">
                  zevent.fun{publicPathFor(invitation, "non-publiée")}
                </p>
              </div>
              <div className="max-h-[46rem] overflow-y-auto overflow-x-hidden">
                <InvitationExperience
                  invitation={invitation}
                  template={template}
                  compact
                  withMusic={false}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageFrame>
  );
}
