import { listPayments, listSettings } from "@/lib/services/admin";
import { ORDRE_FOURNISSEURS } from "@/lib/payments";
import { SITE } from "@/lib/config";
import { ProviderCard } from "@/components/admin/provider-card";

export const metadata = { title: "Paiements" };

/* Les deux fournisseurs sont indépendants : on peut les couper tous
   les deux, n'en garder qu'un, ou basculer de l'un à l'autre sans
   redéploiement. */
export default async function AdminPaiements() {
  const [reglages, paiements] = await Promise.all([listSettings(), listPayments(25)]);

  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <p className="eyebrow text-gold">Encaissement</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)]">Moyens de paiement</h1>
        <p className="max-w-2xl text-sm font-light leading-[1.8] text-ink-soft">
          Chaque fournisseur s’active indépendamment. Une clé secrète et un secret de signature ne
          sont jamais réaffichés une fois enregistrés : laissez le champ vide pour conserver la
          valeur en place.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {ORDRE_FOURNISSEURS.map((id) => {
          const reglage = reglages.find((r) => r.provider === id);
          if (!reglage) return null;
          return (
            <ProviderCard
              key={id}
              /* On ne transmet que l'affichable : la clé et le secret
                 restent sur le serveur. Passer `reglage` entier les
                 aurait sérialisés dans la page. */
              reglage={{
                provider: reglage.provider,
                enabled: reglage.enabled,
                environment: reglage.environment,
                product_id: reglage.product_id,
                aUneCle: Boolean(reglage.api_key),
                aUnSecret: Boolean(reglage.webhook_secret),
              }}
              webhookUrl={
                id === "saspay"
                  ? `${SITE.url}/api/paiements/saspay/webhook`
                  : `${SITE.url}/api/paiements/chariow/pulse`
              }
            />
          );
        })}
      </div>

      <section className="grid gap-4">
        <h2 className="font-display text-[1.4rem] font-bold">Derniers paiements</h2>
        {paiements.length === 0 ? (
          <p className="border-t border-line py-10 text-center text-sm font-light text-ink-soft">
            Aucun paiement pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {["Date", "Fournisseur", "Référence", "Montant", "Statut"].map((titre) => (
                    <th key={titre} className="eyebrow-sm py-3 pr-4 font-semibold text-ink-faint">
                      {titre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className="border-b border-line">
                    <td className="py-3 pr-4 text-sm font-light text-ink-soft">
                      {new Date(paiement.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 pr-4 text-sm capitalize">{paiement.provider}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-ink-faint">
                      {paiement.provider_reference ?? "—"}
                    </td>
                    <td className="numeral py-3 pr-4 text-sm">
                      {paiement.amount.toLocaleString("fr-FR")} {paiement.currency}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`eyebrow-sm rounded-full px-3 py-1 ${
                          paiement.status === "success"
                            ? "bg-burgundy text-white"
                            : paiement.status === "failed" || paiement.status === "cancelled"
                              ? "bg-danger/10 text-danger"
                              : "bg-ivory-deep text-ink-soft"
                        }`}
                      >
                        {paiement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
