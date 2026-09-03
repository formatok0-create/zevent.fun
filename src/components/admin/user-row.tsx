"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  renameUserAction,
  revokeUserAction,
  setUserRoleAction,
  setUserStatusAction,
} from "@/app/admin/actions";
import type { AdminUser } from "@/types/admin";

export function UserRow({ utilisateur, estMoi }: { utilisateur: AdminUser; estMoi: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const [confirme, setConfirme] = useState<"bloquer" | "retirer" | null>(null);
  const [enCours, demarrer] = useTransition();
  const { toast } = useToast();

  const bloque = utilisateur.status === "blocked";
  const nom =
    [utilisateur.firstName, utilisateur.lastName].filter(Boolean).join(" ") ||
    utilisateur.email ||
    "Compte sans nom";

  function lancer(promesse: Promise<{ ok: boolean; message: string }>) {
    demarrer(async () => {
      const res = await promesse;
      toast({ title: res.message, tone: res.ok ? "success" : "danger" });
    });
  }

  return (
    <li className="rounded-sm border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-5">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2.5">
            <b className="font-display text-[1.15rem] font-bold">{nom}</b>
            {utilisateur.role === "admin" && (
              <span className="eyebrow-sm rounded-full bg-burgundy px-2.5 py-1 text-white">Admin</span>
            )}
            {bloque && (
              <span className="eyebrow-sm rounded-full bg-danger/10 px-2.5 py-1 text-danger">Bloqué</span>
            )}
          </p>
          <p className="mt-1 text-xs font-light text-ink-faint">
            {utilisateur.email || utilisateur.id}
            {" · "}
            {utilisateur.invitations} invitation{utilisateur.invitations > 1 ? "s" : ""}
            {utilisateur.published > 0 && `, dont ${utilisateur.published} en ligne`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOuvert((v) => !v)}>
            {ouvert ? "Fermer" : "Modifier"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={enCours}
            onClick={() => (bloque ? lancer(setUserStatusAction(utilisateur.id, "active")) : setConfirme("bloquer"))}
          >
            {bloque ? "Réactiver" : "Bloquer"}
          </Button>
        </div>
      </div>

      {ouvert && (
        <div className="grid gap-6 border-t border-line p-5 sm:p-6">
          <form
            action={(formData) => lancer(renameUserAction(utilisateur.id, formData))}
            className="grid gap-5 sm:grid-cols-2"
          >
            <Field label="Prénom">
              {({ id }) => <Input id={id} name="first_name" defaultValue={utilisateur.firstName ?? ""} />}
            </Field>
            <Field label="Nom">
              {({ id }) => <Input id={id} name="last_name" defaultValue={utilisateur.lastName ?? ""} />}
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" loading={enCours}>
                Enregistrer le profil
              </Button>
            </div>
          </form>

          <div className="grid gap-3 border-t border-line pt-5">
            <p className="eyebrow-sm text-ink-faint">Rôle et sanctions</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                loading={enCours}
                onClick={() =>
                  lancer(setUserRoleAction(utilisateur.id, utilisateur.role === "admin" ? "user" : "admin"))
                }
              >
                {utilisateur.role === "admin" ? "Retirer l’administration" : "Nommer administrateur"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirme("retirer")}>
                Retirer les invitations du public
              </Button>
            </div>
            {estMoi && (
              <p className="text-xs font-light text-ink-faint">
                C’est votre propre compte : vous ne pouvez pas vous retirer le rôle d’administrateur.
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirme === "bloquer"}
        onClose={() => setConfirme(null)}
        title="Bloquer ce compte ?"
        description="Il ne pourra plus se connecter. Ses invitations restent en base et le blocage est réversible."
        confirmLabel="Bloquer"
        loading={enCours}
        onConfirm={() => {
          setConfirme(null);
          lancer(setUserStatusAction(utilisateur.id, "blocked"));
        }}
      />

      <ConfirmDialog
        open={confirme === "retirer"}
        onClose={() => setConfirme(null)}
        title="Retirer les invitations du public ?"
        description="Les liens publics cesseront de répondre. Le compte et les contenus sont conservés, et l’auteur peut republier."
        confirmLabel="Retirer"
        loading={enCours}
        onConfirm={() => {
          setConfirme(null);
          lancer(revokeUserAction(utilisateur.id));
        }}
      />
    </li>
  );
}
