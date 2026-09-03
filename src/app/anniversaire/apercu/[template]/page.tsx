import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationExperience } from "@/templates/components/renderer";
import { getTemplate, listTemplatesForProduct, productOf } from "@/templates/registry";
import { demoBirthdayInvitation } from "@/lib/demo/fete";

/* Aperçu d’une collection de la fête, sans compte et sans base :
   l’invitation est fictive, construite en mémoire. C’est ce que
   verra un invité, enveloppe comprise. */

export function generateStaticParams() {
  return listTemplatesForProduct("anniversaire").map((t) => ({ template: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ template: string }>;
}): Promise<Metadata> {
  const { template } = await params;
  const definition = getTemplate(template);
  return { title: `${definition.name} — aperçu`, robots: { index: false } };
}

export default async function ApercuPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const definition = getTemplate(template);
  if (definition.id !== template || productOf(definition) !== "anniversaire") notFound();

  const others = listTemplatesForProduct("anniversaire").filter((t) => t.id !== definition.id);

  return (
    <>
      <InvitationExperience
        invitation={demoBirthdayInvitation(definition.id, definition.audience)}
        template={definition}
        withMusic={false}
      />

      {/* Barre d’aperçu : elle n’existe que sur cette route. */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-ivory/95 backdrop-blur-md">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="eyebrow-sm text-ink-faint">
            Aperçu — {definition.name} · {definition.ageRange}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {others.map((t) => (
              <Link
                key={t.id}
                href={`/anniversaire/apercu/${t.id}`}
                className="eyebrow-sm link-draw text-ink-soft hover:text-ink"
              >
                {t.name}
              </Link>
            ))}
            <Link href="/anniversaire" className="eyebrow-sm link-draw text-ink">
              Retour
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
