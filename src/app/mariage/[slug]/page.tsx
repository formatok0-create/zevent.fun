import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { InvitationExperience } from "@/templates/components/renderer";
import { getTemplate } from "@/templates/registry";
import { getPublishedInvitation } from "@/lib/services/invitations";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { SITE } from "@/lib/config";
import { getSiteUrl } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* Rendu à la demande. Un cache, même court, servait un 404 aux
   invités pendant la minute qui suivait la publication. Les images
   et les polices restent en cache CDN : la page reste rapide. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getPublishedInvitation(slug, "mariage");

  if (!invitation) {
    return { title: "Invitation introuvable", robots: { index: false } };
  }

  const names = `${invitation.bride_name} & ${invitation.groom_name}`;
  const date = formatWeddingDateLong(invitation.wedding_date);
  const description = invitation.venue
    ? `${date} — ${invitation.venue}. Vous êtes invité·e à célébrer notre union.`
    : `${date}. Vous êtes invité·e à célébrer notre union.`;
  const base = await getSiteUrl();
  const url = `${base}/mariage/${slug}`;
  const image = invitation.cover_image_url ?? `${base}/api/og?slug=${slug}`;

  return {
    title: `${names} — ${date}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: SITE.name,
      title: `${names}`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: names }],
    },
    twitter: { card: "summary_large_image", title: names, description, images: [image] },
  };
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const invitation = await getPublishedInvitation(slug, "mariage");
  if (!invitation) {
    /* Un lien deja partage peut pointer sur l'autre produit : plutot
       qu'une impasse, on renvoie sur la bonne route. */
    const elsewhere = await getPublishedInvitation(slug);
    if (elsewhere) redirect(`/${elsewhere.product ?? "mariage"}/${slug}`);
    notFound();
  }

  const template = getTemplate(invitation.template_id);

  return (
    <>
      <InvitationExperience invitation={invitation} template={template} />
      <footer
        className="border-t border-[var(--tpl-line)] bg-[var(--tpl-bg)] py-8 text-center"
        style={{
          ["--tpl-line" as string]: template.colors.line,
          ["--tpl-bg" as string]: template.colors.background,
        }}
      >
        <Link
          href="/"
          className="text-[0.5625rem] uppercase tracking-[0.28em] text-[var(--tpl-ink-soft)] opacity-60 transition-opacity hover:opacity-100"
          style={{ ["--tpl-ink-soft" as string]: template.colors.inkSoft }}
        >
          Invitation créée avec Zevent
        </Link>
      </footer>
    </>
  );
}
