"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useCopy } from "@/lib/hooks/use-copy";
import { saveProviderAction, toggleProviderAction } from "@/app/admin/actions";
import type { PaymentEnvironment, PaymentProviderId } from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   Cette carte est un composant client : tout ce qu'on lui passe est
   sérialisé dans la page et parvient au navigateur. Elle ne reçoit
   donc JAMAIS la clé ni le secret — seulement deux booléens disant
   s'ils existent, ce qui suffit à choisir le texte d'aide.
   ═══════════════════════════════════════════════════════════════ */

export interface ReglageAffichable {
  provider: PaymentProviderId;
  enabled: boolean;
  environment: PaymentEnvironment;
  /** L'identifiant de produit n'est pas un secret : il figure dans
   *  l'URL publique de la boutique Chariow. */
  product_id: string | null;
  aUneCle: boolean;
  aUnSecret: boolean;
}

const NOMS: Record<string, { titre: string; sous: string; doc: string }> = {
  saspay: {
    titre: "SasPay",
    sous: "Mobile money et carte, Afrique de l’Ouest et du Centre",
    doc: "https://docs.saspay.me/api-reference/introduction",
  },
  chariow: {
    titre: "Chariow",
    sous: "Vente de produits numériques",
    doc: "https://chariow.dev/en/introduction/overview",
  },
};

export function ProviderCard({
  reglage,
  webhookUrl,
}: {
  reglage: ReglageAffichable;
  webhookUrl: string;
}) {
  const meta = NOMS[reglage.provider];
  const [actif, setActif] = useState(reglage.enabled);
  const [enCours, demarrer] = useTransition();
  const { toast } = useToast();
  const { copied, copy } = useCopy();

  function basculer() {
    const suivant = !actif;
    setActif(suivant);
    demarrer(async () => {
      const res = await toggleProviderAction(reglage.provider, suivant);
      /* On remet l'interrupteur dans son état réel si le serveur a
         refusé : sinon l'écran ment sur l'état du système. */
      if (!res.ok) setActif(!suivant);
      toast({ title: res.message, tone: res.ok ? "success" : "danger" });
    });
  }

  function enregistrer(formData: FormData) {
    demarrer(async () => {
      const res = await saveProviderAction(reglage.provider, formData);
      toast({ title: res.message, tone: res.ok ? "success" : "danger" });
    });
  }

  return (
    <section className="grid gap-6 rounded-sm border border-line bg-surface p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="font-display text-[1.35rem] font-bold">{meta.titre}</h2>
          <p className="text-sm font-light text-ink-soft">{meta.sous}</p>
          <a
            href={meta.doc}
            target="_blank"
            rel="noreferrer"
            className="eyebrow-sm link-draw mt-1 inline-flex min-h-11 items-center text-gold"
          >
            Documentation
          </a>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={actif}
          aria-label={`${actif ? "Désactiver" : "Activer"} ${meta.titre}`}
          onClick={basculer}
          disabled={enCours}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-400 ease-silk disabled:opacity-50 ${
            actif ? "bg-burgundy" : "bg-line-strong"
          }`}
        >
          <span
            aria-hidden
            className={`absolute top-1 size-6 rounded-full bg-white transition-all duration-400 ease-silk ${
              actif ? "left-7" : "left-1"
            }`}
          />
        </button>
      </header>

      <form action={enregistrer} className="grid gap-5">
        <Field label="Environnement">
          {({ id }) => (
            <select
              id={id}
              name="environment"
              defaultValue={reglage.environment}
              className="w-full border-b border-line bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-gold"
            >
              <option value="test">Test</option>
              <option value="live">Production</option>
            </select>
          )}
        </Field>

        <Field
          label="Clé secrète d’API"
          hint={reglage.aUneCle ? "Une clé est enregistrée. Laissez vide pour la conserver." : "sk_test_… ou sk_live_…"}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              name="api_key"
              type="password"
              autoComplete="off"
              placeholder={reglage.aUneCle ? "••••••••••••" : "sk_test_…"}
            />
          )}
        </Field>

        <Field
          label="Secret de signature des webhooks"
          hint={
            reglage.provider === "chariow"
              ? "Le secret du Pulse (whsec_…), pas la clé d’API : ce sont deux valeurs distinctes."
              : "Il n’est affiché qu’une fois, à la création du webhook."
          }
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              name="webhook_secret"
              type="password"
              autoComplete="off"
              placeholder={reglage.aUnSecret ? "••••••••••••" : "whsec_…"}
            />
          )}
        </Field>

        {reglage.provider === "chariow" && (
          /* Le produit ne se règle plus ici : il y en a un par tarif,
             puisque Chariow facture le prix du produit et non le
             montant qu'on lui donne. */
          <p className="rounded-sm border border-line bg-ivory-deep px-4 py-3 text-xs font-light leading-relaxed text-ink-soft">
            Chariow vend un produit à son prix. Créez un produit par tarif dans votre boutique, puis
            collez leurs identifiants dans <b className="font-medium text-ink">Administration →
            Tarifs</b>.
          </p>
        )}

        <div className="grid gap-2">
          <p className="eyebrow-sm text-ink-faint">
            {reglage.provider === "chariow" ? "URL du Pulse" : "URL du webhook"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 truncate rounded-sm bg-ivory-deep px-3 py-2 font-mono text-xs text-ink-soft">
              {webhookUrl}
            </code>
            <Button type="button" variant="ghost" size="sm" onClick={() => copy(webhookUrl)}>
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
        </div>

        <Button type="submit" loading={enCours} className="w-fit">
          Enregistrer
        </Button>
      </form>
    </section>
  );
}
