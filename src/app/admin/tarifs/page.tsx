import { listPlans } from "@/lib/services/admin";
import { PlanRow } from "@/components/admin/plan-row";

export const metadata = { title: "Tarifs" };

export default async function AdminTarifs() {
  const plans = await listPlans();

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <p className="eyebrow text-gold">Grille</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)]">Tarifs</h1>
        <p className="max-w-2xl text-sm font-light leading-[1.8] text-ink-soft">
          Les montants sont en unité entière de la devise : 15000 XOF, pas 150,00. Le franc CFA n’a
          pas de centimes, et un entier évite les arrondis qu’un flottant traîne jusqu’en base.
        </p>
      </header>

      {/* Deux grilles séparées : le mariage a un prix unique, la fête
          un prix par tranche d'âge — les mélanger dans une seule liste
          laissait croire que c'était la même logique. */}
      {[
        { titre: "Mariage", note: "Un prix unique, quelle que soit la collection.", codes: (c: string) => c === "mariage" },
        { titre: "Anniversaire", note: "Un prix par tranche d’âge, dans l’ordre du parcours.", codes: (c: string) => c.startsWith("anniversaire") },
      ].map((groupe) => {
        const lot = plans.filter((p) => groupe.codes(p.code));
        if (lot.length === 0) return null;
        return (
          <section key={groupe.titre} className="grid gap-4">
            <div className="grid gap-1 border-t border-line pt-6">
              <h2 className="font-display text-[1.4rem] font-bold">{groupe.titre}</h2>
              <p className="text-sm font-light text-ink-soft">{groupe.note}</p>
            </div>
            <ul className="grid gap-4">
              {lot.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
