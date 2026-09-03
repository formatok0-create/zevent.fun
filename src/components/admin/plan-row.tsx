"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { savePlanAction } from "@/app/admin/actions";
import type { Plan } from "@/types/admin";

export function PlanRow({ plan }: { plan: Plan }) {
  const [enCours, demarrer] = useTransition();
  const { toast } = useToast();

  function enregistrer(formData: FormData) {
    demarrer(async () => {
      const res = await savePlanAction(plan.id, formData);
      toast({ title: res.message, tone: res.ok ? "success" : "danger" });
    });
  }

  return (
    <li className="rounded-sm border border-line bg-surface p-6 sm:p-8">
      <form action={enregistrer} className="grid gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="eyebrow-sm text-gold">{plan.code}</p>
          <p className="numeral text-[1.3rem]">
            {plan.amount.toLocaleString("fr-FR")} {plan.currency}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom">
            {({ id }) => <Input id={id} name="name" defaultValue={plan.name} required />}
          </Field>

          <div className="grid grid-cols-[1fr_7rem] gap-4">
            <Field label="Montant">
              {({ id }) => (
                <Input
                  id={id}
                  name="amount"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={plan.amount}
                  required
                />
              )}
            </Field>
            <Field label="Devise">
              {({ id }) => (
                <Input id={id} name="currency" maxLength={3} defaultValue={plan.currency} required />
              )}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description" optional>
              {({ id }) => (
                <Textarea id={id} name="description" rows={2} defaultValue={plan.description ?? ""} />
              )}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              label="Produit Chariow"
              optional
              hint="Chariow vend un produit à son prix, pas un montant libre : créez dans votre boutique un produit à ce tarif et collez son identifiant. Inutile si vous n’encaissez que par SasPay."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  name="chariow_product_id"
                  defaultValue={plan.chariow_product_id ?? ""}
                  placeholder="prd_abc123xyz"
                />
              )}
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <label className="flex min-h-11 items-center gap-3 text-sm font-light text-ink-soft">
            <input
              type="checkbox"
              name="active"
              defaultChecked={plan.active}
              className="size-4 accent-[var(--color-burgundy)]"
            />
            Proposé à l’achat
          </label>
          <Button type="submit" size="sm" loading={enCours}>
            Enregistrer
          </Button>
        </div>
      </form>
    </li>
  );
}
