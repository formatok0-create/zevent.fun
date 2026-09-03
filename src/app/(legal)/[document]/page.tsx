import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import type { Metadata } from "next";
import { Icone } from "@/components/ui/logo";

/* ═══════════════════════════════════════════════════════════════
   LES TEXTES LÉGAUX
   Les trois documents vivent en markdown dans `src/content/legal`.
   Les tenir hors du code permet de les corriger sans toucher à un
   composant — un texte légal se relit et se modifie souvent.
   ═══════════════════════════════════════════════════════════════ */

const DOCUMENTS = {
  "conditions-generales": {
    fichier: "conditions-generales.md",
    titre: "Conditions générales de vente",
    intitule: "Le contrat",
  },
  confidentialite: {
    fichier: "confidentialite.md",
    titre: "Politique de confidentialité",
    intitule: "Vos données",
  },
  "mentions-legales": {
    fichier: "mentions-legales.md",
    titre: "Mentions légales",
    intitule: "L’éditeur",
  },
} as const;

type Cle = keyof typeof DOCUMENTS;

export function generateStaticParams() {
  return Object.keys(DOCUMENTS).map((document) => ({ document }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ document: string }>;
}): Promise<Metadata> {
  const { document } = await params;
  const meta = DOCUMENTS[document as Cle];
  if (!meta) return {};
  return { title: meta.titre, description: `${meta.titre} de Zevent.` };
}

async function lire(fichier: string): Promise<string> {
  const chemin = path.join(process.cwd(), "src/content/legal", fichier);
  const brut = await readFile(chemin, "utf8");

  /* Les trois textes ne titrent pas de la même façon : deux numérotent
     leurs sections en `##`, les mentions légales en `#`. Rendus tels
     quels, tous les titres des mentions sortaient en taille de
     couverture. On ne garde donc qu'un seul `#`, le premier, et on
     rétrograde les suivants — la hiérarchie devient la même partout,
     sans toucher aux fichiers. */
  let premier = true;
  return brut
    .split("\n")
    .map((ligne) => {
      if (!ligne.startsWith("# ")) return ligne;
      if (premier) {
        premier = false;
        return ligne;
      }
      return `#${ligne}`;
    })
    .join("\n");
}

export default async function DocumentLegal({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  const meta = DOCUMENTS[document as Cle];
  if (!meta) notFound();

  const source = await lire(meta.fichier);
  /* Le markdown vient de nos propres fichiers, jamais d'une saisie
     utilisateur : il n'y a rien à assainir ici. */
  const html = await marked.parse(source, { gfm: true, breaks: false });

  return (
    <div className="voix-cerise fond-cerise min-h-dvh">
      <header className="border-b border-line">
        <div className="shell flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex min-h-11 items-center gap-3">
            <Icone className="size-7" />
            <span className="font-display text-[1rem] font-semibold leading-none tracking-[0.24em]">
              ZEVENT
            </span>
          </Link>
          <nav aria-label="Documents légaux" className="flex flex-wrap gap-x-5 gap-y-1">
            {(Object.keys(DOCUMENTS) as Cle[]).map((cle) => (
              <Link
                key={cle}
                href={`/${cle}`}
                aria-current={cle === document ? "page" : undefined}
                className={`eyebrow-sm inline-flex min-h-11 items-center transition-colors ${
                  cle === document ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                }`}
              >
                {DOCUMENTS[cle].intitule}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="shell py-12 sm:py-20">
        <article
          className="zv-legal mx-auto max-w-[46rem]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <footer className="shell border-t border-line py-8">
        <Link href="/" className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-soft">
          ← Retour à l’accueil
        </Link>
      </footer>
    </div>
  );
}
