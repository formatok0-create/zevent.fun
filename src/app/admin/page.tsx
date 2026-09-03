import Link from "next/link";
import { listPayments, listPlans, listSettings, listUsers } from "@/lib/services/admin";
import { ORDRE_FOURNISSEURS } from "@/lib/payments";
import { isSupabaseConfigured } from "@/lib/config";

export default async function AdminAccueil() {
  const [utilisateurs, reglages, plans, paiements] = await Promise.all([
    listUsers(),
    listSettings(),
    listPlans(),
    listPayments(8),
  ]);

  const actifs = utilisateurs.filter((u) => u.status === "active").length;
  const bloques = utilisateurs.length - actifs;
  const enLigne = utilisateurs.reduce((total, u) => total + u.published, 0);
  const encaisse = paiements
    .filter((p) => p.status === "success")
    .reduce((total, p) => total + p.amount, 0);

  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <p className="eyebrow text-gold">Administration</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)]">Vue d’ensemble</h1>
      </header>

      {!isSupabaseConfigured && (
        <p className="rounded-sm border border-gold/40 bg-champagne-soft px-5 py-4 text-sm font-light leading-relaxed text-ink-soft">
          <b className="font-medium text-ink">Mode démonstration.</b> Les réglages et les rôles
          vivent en mémoire et disparaissent au redémarrage. Renseignez les variables Supabase et
          jouez <code className="font-mono text-[0.85em]">migration-004-admin-paiements.sql</code>{" "}
          pour qu’ils soient conservés.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Chiffre valeur={String(utilisateurs.length)} libelle="Comptes" detail={`${bloques} bloqué${bloques > 1 ? "s" : ""}`} />
        <Chiffre valeur={String(enLigne)} libelle="Invitations en ligne" />
        <Chiffre
          valeur={String(reglages.filter((r) => r.enabled).length)}
          libelle="Fournisseurs actifs"
          detail={`sur ${ORDRE_FOURNISSEURS.length}`}
        />
        <Chiffre
          valeur={encaisse.toLocaleString("fr-FR")}
          libelle="Encaissé (derniers paiements)"
          detail={paiements[0]?.currency ?? "XOF"}
        />
      </div>

      <section className="grid gap-4">
        <h2 className="font-display text-[1.4rem] font-bold">Les fournisseurs</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ORDRE_FOURNISSEURS.map((id) => {
            const reglage = reglages.find((r) => r.provider === id);
            const actif = reglage?.enabled ?? false;
            const configure = Boolean(reglage?.api_key);
            return (
              <Link
                key={id}
                href="/admin/paiements"
                className="flex items-center justify-between gap-4 rounded-sm border border-line bg-surface px-5 py-4 transition-colors hover:border-gold"
              >
                <span className="grid gap-1">
                  <b className="font-display text-[1.1rem] font-bold capitalize">{id}</b>
                  <span className="eyebrow-sm text-ink-faint">
                    {reglage?.environment === "live" ? "Production" : "Test"}
                    {configure ? " · clé renseignée" : " · clé manquante"}
                  </span>
                </span>
                <span
                  className={`zv-maison inline-flex min-h-9 items-center rounded-full px-4 text-[0.65rem] font-semibold uppercase ${
                    actif ? "bg-burgundy text-white" : "border border-line-strong text-ink-faint"
                  }`}
                >
                  {actif ? "Actif" : "Coupé"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-[1.4rem] font-bold">Les tarifs</h2>
        <ul className="grid gap-2">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-3"
            >
              <span className="font-display text-[1.05rem] font-bold">{plan.name}</span>
              <span className="numeral text-[1.05rem]">
                {plan.amount.toLocaleString("fr-FR")} {plan.currency}
                {!plan.active && <span className="eyebrow-sm ml-3 text-ink-faint">inactif</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Chiffre({ valeur, libelle, detail }: { valeur: string; libelle: string; detail?: string }) {
  return (
    <div className="rounded-sm border border-line bg-surface px-5 py-5">
      <p className="numeral text-[clamp(1.6rem,4vw,2.1rem)] leading-none">{valeur}</p>
      <p className="eyebrow-sm mt-3 text-ink-soft">{libelle}</p>
      {detail && <p className="mt-1 text-xs font-light text-ink-faint">{detail}</p>}
    </div>
  );
}
