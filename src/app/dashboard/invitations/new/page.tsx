import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import { InvitationWizard } from "@/components/invitation/wizard";
import { BirthdayWizard } from "@/components/invitation/birthday-wizard";
import { requireUser } from "@/lib/services/session";
import { BIRTHDAY_BRACKETS, audienceOf2 } from "@/templates/registry";

/* Les deux plaques du choix de public, par tranche. */
const GENRE_PLATES = {
  enfant: {
    garcon: "linear-gradient(158deg, #BFE3A8, #3E8F45)", btnG: "#2F7A38",
    fille: "linear-gradient(158deg, #FBDCEF, #8FD3E8)", btnF: "#C93C86",
    blurbG: "Royaume, Comics, Petit Patron, Cosmos.",
    blurbF: "Cristal, Papillons, Licorne, Lagon.",
  },
  "jeune-ado": {
    garcon: "linear-gradient(158deg, #1B3358, #0A1220)", btnG: "#1B3358",
    fille: "linear-gradient(158deg, #F7C9DC, #D9749F)", btnF: "#D9749F",
    blurbG: "Arène, Voltage, Nuit bleue. Terrain, éclair et bleu de nuit.",
    blurbF: "Perle, Gemme, Nuage. Perles, facettes et ciel rose.",
  },
  ado: {
    garcon: "linear-gradient(158deg, #2A282C, #131315)", btnG: "#C43A2F",
    fille: "linear-gradient(158deg, #3A2352, #150F1E)", btnF: "#A96CE0",
    blurbG: "Bitume, Néon, Braise. Béton, grille rose et toits en feu.",
    blurbF: "Velours rose, Pétales, Château. Violet, roses et nuages.",
  },
  adulte: {
    garcon: "linear-gradient(158deg, #302F2F, #070607)", btnG: "#B4232A",
    fille: "linear-gradient(158deg, #6E1424, #150609)", btnF: "#E23B57",
    blurbG: "Smoking, Ambre, Émeraude. Sobre, habillé, sans tapage.",
    blurbF: "Rubis, Magenta, Lune. Roses rouges, néons et pleine lune.",
  },
} as const;
import type { TemplateAudience } from "@/templates/types";

export const metadata: Metadata = { title: "Créer une invitation" };

/* Les quatre portes du produit anniversaire. */
const BRACKET_CARDS = [
  {
    key: "enfant",
    label: "Enfant",
    range: BIRTHDAY_BRACKETS.enfant.range,
    plate: "linear-gradient(158deg, #BFE3A8, #3E8F45)",
    ink: "#123018",
    btn: "#2F7A38",
    blurb: "Huit collections, filles et garçons. Champignons, licornes, éclairs et arcs-en-ciel.",
  },
  {
    key: "jeune-ado",
    label: "Jeune adolescent",
    range: BIRTHDAY_BRACKETS["jeune-ado"].range,
    plate: "linear-gradient(158deg, #1B3358, #0A1220)",
    ink: "#8FCBFF",
    btn: "#1B3358",
    blurb: "Arène, Voltage, Nuit bleue. Le même soin que pour les enfants, en plus moderne.",
  },
  {
    key: "ado",
    label: "Adolescent",
    range: BIRTHDAY_BRACKETS.ado.range,
    plate: "linear-gradient(158deg, #2A282C, #131315)",
    ink: "#F08276",
    btn: "#C43A2F",
    blurb: "Bitume, Néon, Braise. Six images d’en-tête à choisir, comme pour un mariage.",
  },
  {
    key: "adulte",
    label: "Adulte",
    range: BIRTHDAY_BRACKETS.adulte.range,
    plate: "linear-gradient(158deg, #302F2F, #070607)",
    ink: "#E9737A",
    btn: "#B4232A",
    blurb: "Smoking, Ambre, Émeraude. Sobre, habillé, avec son en-tête au choix.",
  },
] as const;

/* Le produit voyage dans l'URL : ?produit=anniversaire. Sans lui,
   on ne devine pas — on demande. */
export default async function NewInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ produit?: string; pour?: string; tranche?: string }>;
}) {
  const user = await requireUser();
  const { produit, pour, tranche: rawTranche } = await searchParams;

  const tranche = BRACKET_CARDS.some((card) => card.key === rawTranche)
    ? (rawTranche as (typeof BRACKET_CARDS)[number]["key"])
    : undefined;

  /* Les tranches 11 – 14, 15 – 17 et 18+ n'ont qu'un seul jeu de
     collections : la tranche vaut donc directement le public. */
  const genre = pour === "fille" || pour === "garcon" ? pour : undefined;
  const audience: TemplateAudience | undefined =
    tranche && genre ? audienceOf2(tranche, genre) : undefined;

  /* Deuxieme question, propre a la fete : la tranche d'age. Elle
     decide des collections, des bornes de saisie et du rayon
     d'en-tetes. On la pose une fois, puis on n'y revient plus. */
  if (produit === "anniversaire" && !audience) {
    if (!tranche) {
      return (
        /* Les deux ecrans qui precedent le wizard font partie du
           parcours anniversaire : ils portent la meme voix. */
        <div className="voix-agrume fond-agrume min-h-dvh">
          <PageFrame>
          <PageHeader
            eyebrow="Nouvel anniversaire"
            title={<>Quel <span className="text-flamme">âge ?</span></>}
            description="Les collections, les couleurs et le ton ne sont pas les mêmes à sept ans qu’à trente."
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {BRACKET_CARDS.map((card) => (
              <Link
                key={card.key}
                href={`/dashboard/invitations/new?produit=anniversaire&tranche=${card.key}`}
                className="group border border-line bg-surface p-8 transition-colors duration-500 ease-silk hover:border-flamme"
              >
                {/* En 5/3 le quadrilobe s'ecrasait : ses rayons sont
                    des pourcentages, ils supposent un carre. */}
                <span
                  className="quatrefoil relative mx-auto grid aspect-square w-full max-w-[14rem] place-items-center"
                  style={{ background: card.plate }}
                >
                  {/* La plage entière, pas un âge au hasard. */}
                  <span
                    className="px-3 text-center font-fete text-[0.95rem] font-bold uppercase tracking-[0.06em] sm:text-[1.1rem]"
                    style={{ color: card.ink }}
                  >
                    {card.range}
                  </span>
                </span>
                <h3 className="mt-6 font-fete text-[1.35rem] font-bold leading-tight">{card.label}</h3>
                <p className="eyebrow-sm mt-2 text-flamme">{card.range}</p>
                <p className="mt-3 text-sm font-light leading-[1.75] text-ink-soft">{card.blurb}</p>
                <span
                  className="mt-6 inline-flex rounded-full px-5 py-2 font-fete text-[0.9rem] font-bold transition-colors duration-500 ease-silk"
                  style={{ background: card.btn, color: "#faf7f2" }}
                >
                  Commencer
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-center">
            <Link href="/dashboard/invitations/new" className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-faint">
              Revenir au choix de la célébration
            </Link>
          </p>
          </PageFrame>
        </div>
      );
    }

    /* Chaque tranche a deux jeux de collections. */
    const feminin = tranche === "adulte" ? "Une femme" : "Une fille";
    const masculin = tranche === "adulte" ? "Un homme" : tranche === "enfant" ? "Un garçon" : "Un garçon";

    return (
      <div className="voix-agrume fond-agrume min-h-dvh">
        <PageFrame>
        <PageHeader
          eyebrow={`Anniversaire · ${BIRTHDAY_BRACKETS[tranche].range}`}
          title={<>Pour <span className="text-flamme">qui ?</span></>}
          description="Les collections et les images d’en-tête diffèrent. Vous pourrez toutes les regarder à l’étape suivante."
        />

        <div className="grid gap-8 sm:grid-cols-2">
          {[
            { genre: "garcon", label: masculin, plate: GENRE_PLATES[tranche].garcon, btn: GENRE_PLATES[tranche].btnG, blurb: GENRE_PLATES[tranche].blurbG },
            { genre: "fille", label: feminin, plate: GENRE_PLATES[tranche].fille, btn: GENRE_PLATES[tranche].btnF, blurb: GENRE_PLATES[tranche].blurbF },
          ].map((choix) => (
            <Link
              key={choix.genre}
              href={`/dashboard/invitations/new?produit=anniversaire&tranche=${tranche}&pour=${choix.genre}`}
              className="group border border-line bg-surface p-8 transition-colors duration-500 ease-silk hover:border-flamme"
            >
              <span
                className="quatrefoil relative mx-auto grid aspect-square w-full max-w-[14rem] place-items-center"
                style={{ background: choix.plate }}
              >
                <span className="px-3 text-center font-fete text-[0.95rem] font-bold uppercase tracking-[0.06em] text-ivory sm:text-[1.1rem]">
                  {BIRTHDAY_BRACKETS[tranche].range}
                </span>
              </span>
              <h3 className="mt-6 font-fete text-[1.35rem] font-bold leading-tight">{choix.label}</h3>
              <p className="mt-3 text-sm font-light leading-[1.75] text-ink-soft">{choix.blurb}</p>
              <span
                className="mt-6 inline-flex rounded-full px-5 py-2 font-fete text-[0.9rem] font-bold text-ivory"
                style={{ background: choix.btn }}
              >
                Voir les collections
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center">
          <Link href="/dashboard/invitations/new?produit=anniversaire" className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-faint">
            Revenir au choix de l’âge
          </Link>
        </p>
        </PageFrame>
      </div>
    );
  }

  if (produit === "anniversaire") {
    return (
      <div className="voix-agrume fond-agrume min-h-dvh">
        <PageFrame>
        <PageHeader
          eyebrow="Nouvel anniversaire"
          title={<>Créons <span className="text-flamme">la fête.</span></>}
          description="Huit étapes, quelques minutes. Rien n’est publié tant que vous ne le décidez pas."
        />
          <BirthdayWizard userId={user.id} audience={audience} />
        </PageFrame>
      </div>
    );
  }

  if (produit === "mariage") {
    return (
      /* Le parcours mariage se detache du gris de l'espace : blanc pur
         sur toute la zone de contenu, comme la landing. */
      <div className="voix-cerise fond-cerise min-h-dvh">
        <PageFrame>
        <PageHeader
          eyebrow="Nouveau mariage"
          title={<>Créons <span className="italic">votre invitation.</span></>}
          description="Sept étapes, quelques minutes. Rien n’est publié tant que vous ne le décidez pas."
        />
          <InvitationWizard userId={user.id} />
        </PageFrame>
      </div>
    );
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Nouvelle invitation"
        title={<>Que <span className="italic">célébrez-vous ?</span></>}
        description="Les deux parcours ne demandent pas les mêmes choses. Choisissez, et on adapte les étapes."
      />

      {/* Les deux formes reprennent celles de la porte : une arche
          bordeaux pleine, un quadrilobe de nuit. L'arche etait un
          degrade blanc sur un fond blanc — on ne la voyait pas.
          Le carre est la seule proportion ou les deux tiennent : en
          4/3 le quadrilobe s'aplatissait en galette. */}
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <Link
          href="/dashboard/invitations/new?produit=mariage"
          className="group flex flex-col rounded-sm border border-line bg-surface p-6 transition-colors duration-500 ease-silk hover:border-gold sm:p-9"
        >
          <span className="arch relative mx-auto grid aspect-square w-full max-w-[15rem] place-items-center bg-[linear-gradient(158deg,#8e1428_0%,#6b1020_45%,#3d070f_100%)] transition-transform duration-[900ms] ease-silk group-hover:-translate-y-1">
            <span
              aria-hidden
              className="absolute inset-3 rounded-[inherit] border border-champagne/40 transition-all duration-[900ms] ease-silk group-hover:inset-4 group-hover:border-champagne/75"
            />
            <span className="relative font-sans text-[0.78rem] font-semibold uppercase tracking-[0.26em] text-white">
              Mariage
            </span>
          </span>
          <h3 className="mt-7 font-display text-[1.5rem] font-bold leading-tight">Un mariage</h3>
          <p className="mt-3 text-sm font-light leading-[1.8] text-ink-soft">
            Deux prénoms, les familles, les cérémonies classées par heure. Musulman ou chrétien,
            dix collections.
          </p>
          <span className="zv-maison mt-7 inline-flex min-h-11 w-fit items-center rounded-full bg-burgundy px-6 text-[0.78rem] font-semibold uppercase text-white transition-colors duration-500 ease-silk group-hover:bg-burgundy-deep">
            Commencer
          </span>
        </Link>

        <Link
          href="/dashboard/invitations/new?produit=anniversaire"
          className="group flex flex-col rounded-sm border border-line bg-surface p-6 transition-colors duration-500 ease-silk hover:border-flamme sm:p-9"
        >
          <span className="quatrefoil plate-fete relative mx-auto grid aspect-square w-full max-w-[15rem] place-items-center transition-transform duration-[900ms] ease-silk group-hover:-translate-y-1">
            <span className="relative font-fete text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white">
              <span
                aria-hidden
                className="mx-auto mb-3 block size-1.5 rounded-full bg-flamme shadow-[0_0_0_5px_rgba(233,161,59,.16)]"
              />
              Anniversaire
            </span>
          </span>
          <h3 className="mt-7 font-display text-[1.5rem] font-bold leading-tight">Un anniversaire</h3>
          <p className="mt-3 text-sm font-light leading-[1.8] text-ink-soft">
            Un prénom, un âge, une adresse — et l’album des années, qui remonte le temps jusqu’à
            aujourd’hui.
          </p>
          <span className="mt-7 inline-flex min-h-11 w-fit items-center rounded-full bg-nuit-fete px-6 font-fete text-[0.85rem] font-bold text-white transition-colors duration-500 ease-silk group-hover:bg-prune">
            Commencer
          </span>
        </Link>
      </div>
    </PageFrame>
  );
}
