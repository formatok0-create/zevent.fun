"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import {
  fournisseursDisponiblesAction,
  ouvrirPaiementAction,
} from "@/app/dashboard/invitations/paiement-actions";
import type { PaymentProviderId } from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   LES MOYENS ACCEPTES

   Quatre logos, puis un « + » : la page hebergee de SasPay en
   propose davantage, et aligner douze vignettes dans un bouton
   n'apprendrait rien de plus. Les quatre choisis sont ceux qu'on
   reconnait sans lire.

   Pour en changer : deposez le fichier dans `public/paiement/` et
   modifiez cette table. Rien d'autre a toucher.
   ═══════════════════════════════════════════════════════════════ */
const LOGOS = [
  { src: "/paiement/wave.png", alt: "Wave" },
  { src: "/paiement/orange-money.png", alt: "Orange Money" },
  { src: "/paiement/operateur-4.png", alt: "Mobile money" },
  { src: "/paiement/visa.png", alt: "Visa" },
];

const NOMS: Record<PaymentProviderId, { titre: string; sous: string }> = {
  saspay: { titre: "Mobile money ou carte", sous: "Vous choisissez votre opérateur à l’étape suivante" },
  chariow: { titre: "Chariow", sous: "Paiement sécurisé par Chariow" },
};

/** Le logo dans sa pastille : fond blanc, coins arrondis, filet fin.
 *  Sans la pastille, Wave (fond cyan) et Orange Money (fond noir)
 *  se cognaient l'un a l'autre. */
function Pastille({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-burgundy/15 bg-white">
      <Image src={src} alt={alt} width={32} height={32} className="size-6 object-contain" />
    </span>
  );
}

export function PaiementBloc({
  invitationId,
  montant,
  devise,
  libelle,
  fournisseurs,
}: {
  invitationId: string;
  montant: number;
  devise: string;
  libelle: string;
  /* `undefined` = à interroger ici, `[]` = déjà interrogé et aucun
     fournisseur disponible. Confondre les deux laissait le bloc sur
     « Chargement… » pour toujours. */
  fournisseurs?: PaymentProviderId[];
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [choisi, setChoisi] = useState<PaymentProviderId | null>(null);
  const [disponibles, setDisponibles] = useState<PaymentProviderId[] | null>(
    fournisseurs ?? null,
  );

  useEffect(() => {
    if (fournisseurs) return setDisponibles(fournisseurs);
    fournisseursDisponiblesAction().then(setDisponibles).catch(() => setDisponibles([]));
  }, [fournisseurs]);

  function payer(provider: PaymentProviderId) {
    setChoisi(provider);
    startTransition(async () => {
      const res = await ouvrirPaiementAction(invitationId, provider);
      if (!res.ok || !res.url) {
        setChoisi(null);
        toast({ title: "Paiement impossible", description: res.message, tone: "danger" });
        return;
      }
      /* On quitte le site vers la page du prestataire. La publication
         se fait au retour, apres verification cote serveur — jamais
         sur la foi du navigateur. */
      window.location.href = res.url;
    });
  }

  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-y border-line py-5">
        <span className="grid gap-1">
          <b className="font-display text-[1.15rem] font-bold">{libelle}</b>
          <span className="eyebrow-sm text-ink-faint">Paiement unique, modifications libres ensuite</span>
        </span>
        <span className="numeral text-[1.6rem] leading-none">
          {montant.toLocaleString("fr-FR")} {devise}
        </span>
      </div>

      <p className="mt-6 text-sm font-light leading-relaxed text-ink-soft">
        Votre invitation est prête. Une fois le paiement confirmé, elle est publiée
        automatiquement et son lien devient actif — vous n’avez rien à faire de plus.
        Vous pourrez la modifier autant que vous voulez, sans repayer.
      </p>

      {disponibles === null ? (
        <div className="mt-8 h-[5.5rem] animate-pulse rounded-sm border border-line bg-ivory-deep" />
      ) : disponibles.length === 0 ? (
        <p className="mt-8 rounded-sm border border-line bg-ivory-deep px-5 py-4 text-sm font-light leading-relaxed text-ink-soft">
          Aucun moyen de paiement n’est actif pour le moment — votre invitation est bien
          enregistrée et vous la retrouverez telle quelle. Réessayez dans un instant, ou
          écrivez-nous à <b className="font-medium text-ink">zeventfun@gmail.com</b>.
        </p>
      ) : (
        <div className="mt-8 grid gap-3">
          {disponibles.map((provider) => {
            const enCours = pending && choisi === provider;
            return (
              <button
                key={provider}
                type="button"
                disabled={pending}
                onClick={() => payer(provider)}
                className="group relative flex w-full flex-col gap-4 rounded-sm border-2 border-burgundy bg-surface px-5 py-5 text-left transition-colors duration-500 ease-silk hover:bg-burgundy hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60 sm:flex-row sm:items-center sm:justify-between sm:gap-5"
              >
                <span className="grid gap-1.5">
                  <b className="font-display text-[1.1rem] font-bold leading-none text-burgundy transition-colors duration-500 group-hover:text-ivory">
                    {NOMS[provider].titre}
                  </b>
                  <span className="text-xs font-light leading-snug text-ink-soft transition-colors duration-500 group-hover:text-ivory/70">
                    {NOMS[provider].sous}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {provider === "saspay" && (
                    <span className="flex items-center -space-x-2">
                      {LOGOS.map((logo) => (
                        <Pastille key={logo.src} {...logo} />
                      ))}
                      {/* Le « + » ferme la file : la page hebergee en
                          propose d'autres, on ne les aligne pas tous. */}
                      <span
                        aria-label="et d’autres moyens de paiement"
                        className="grid size-8 shrink-0 place-items-center rounded-full border border-burgundy/15 bg-burgundy text-[0.9rem] leading-none text-ivory"
                      >
                        +
                      </span>
                    </span>
                  )}
                  <span className="eyebrow-sm ml-1 whitespace-nowrap text-gold transition-colors duration-500 group-hover:text-champagne">
                    {enCours ? "Ouverture…" : "Payer →"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs font-light leading-relaxed text-ink-faint">
        En payant, vous acceptez les conditions générales de vente. Le lien public reste actif
        jusqu’à la fin du compte à rebours.
      </p>
    </div>
  );
}
