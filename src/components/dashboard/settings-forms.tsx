"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plate } from "@/components/ui/plate";
import { uploadImage, UploadError } from "@/lib/services/storage";
import { profileSchema, type ProfileValues } from "@/lib/validation/schemas";
import { signOutAction } from "@/app/(auth)/actions";
import {
  changeEmailAction,
  changePasswordAction,
  deleteAccountAction,
  updateAvatarAction,
  updateLocaleAction,
  updateProfileAction,
} from "@/app/dashboard/actions";
import type { Profile, SessionUser } from "@/types/database";

export function SettingsSection({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={
        danger
          ? "rounded-sm border border-danger/25 bg-danger/[0.03] p-8"
          : "grid gap-10 border-t border-line pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
      }
    >
      <div className={danger ? "mb-6" : undefined}>
        <h2 className={`font-display text-[1.5rem] leading-none ${danger ? "text-danger" : ""}`}>
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      <div className="max-w-lg">{children}</div>
    </section>
  );
}

/* ── Profil ─────────────────────────────────────────────────── */

export function ProfileForm({ user, profile }: { user: SessionUser; profile: Profile | null }) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name ?? user.firstName ?? "",
      last_name: profile?.last_name ?? user.lastName ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateProfileAction(values);
    toast({
      title: result.ok ? "Profil enregistré" : "Enregistrement impossible",
      description: result.message,
      tone: result.ok ? "success" : "danger",
    });
    if (result.ok) router.refresh();
  });

  const pickAvatar = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(files[0], "avatars", user.id);
      setAvatar(url);
      const result = await updateAvatarAction(url);
      toast({
        title: result.ok ? "Photo mise à jour" : "Envoi impossible",
        description: result.message,
        tone: result.ok ? "success" : "danger",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <div className="w-20 shrink-0">
          <Plate
            src={avatar}
            shape="arch"
            ratio="aspect-[4/5]"
            monogram={(user.firstName?.[0] ?? user.email[0] ?? "Z").toUpperCase()}
            sizes="80px"
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => pickAvatar(event.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink transition-colors hover:text-burgundy disabled:opacity-50"
          >
            {uploading ? "Envoi en cours…" : avatar ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={async () => {
                setAvatar(null);
                await updateAvatarAction(null);
                router.refresh();
              }}
              className="eyebrow-sm link-draw text-ink-faint transition-colors hover:text-danger"
            >
              Retirer
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Prénom" error={errors.first_name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-invalid={invalid} aria-describedby={describedBy} {...register("first_name")} />
            )}
          </Field>
          <Field label="Nom" optional error={errors.last_name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-invalid={invalid} aria-describedby={describedBy} {...register("last_name")} />
            )}
          </Field>
        </div>

        <Button type="submit" size="sm" variant="outline" loading={isSubmitting} disabled={!isDirty}>
          Enregistrer
        </Button>
      </form>
    </div>
  );
}

/* ── Compte : e-mail et mot de passe ────────────────────────── */

export function AccountForms({ email }: { email: string }) {
  const { toast } = useToast();
  const [nextEmail, setNextEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <Field label="Adresse e-mail" hint="Un lien de confirmation est envoyé à la nouvelle adresse.">
          {({ id }) => (
            <Input
              id={id}
              type="email"
              value={nextEmail}
              onChange={(event) => setNextEmail(event.target.value)}
            />
          )}
        </Field>
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          disabled={nextEmail === email || !nextEmail}
          onClick={() =>
            startTransition(async () => {
              const result = await changeEmailAction(nextEmail);
              toast({
                title: result.ok ? "Demande enregistrée" : "Modification impossible",
                description: result.message,
                tone: result.ok ? "success" : "danger",
              });
            })
          }
        >
          Modifier l’e-mail
        </Button>
      </div>

      <div className="space-y-6 border-t border-line pt-10">
        <Field label="Nouveau mot de passe" hint="Au moins 8 caractères.">
          {({ id }) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder="••••••••"
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          disabled={password.length < 8}
          onClick={() =>
            startTransition(async () => {
              const result = await changePasswordAction(password);
              toast({
                title: result.ok ? "Mot de passe modifié" : "Modification impossible",
                description: result.message,
                tone: result.ok ? "success" : "danger",
              });
              if (result.ok) setPassword("");
            })
          }
        >
          Modifier le mot de passe
        </Button>
      </div>
    </div>
  );
}

/* ── Préférences ────────────────────────────────────────────── */

export function PreferencesForm({ locale }: { locale: string }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Field label="Langue de l’interface" hint="Les invitations publiques restent dans la langue que vous écrivez.">
      {({ id }) => (
        <Select
          id={id}
          defaultValue={locale}
          disabled={pending}
          onChange={(event) =>
            startTransition(async () => {
              const result = await updateLocaleAction(event.target.value);
              toast({
                title: result.ok ? "Préférence enregistrée" : "Enregistrement impossible",
                description: result.message,
                tone: result.ok ? "success" : "danger",
              });
            })
          }
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </Select>
      )}
    </Field>
  );
}

/* ── Sécurité ───────────────────────────────────────────────── */

export function SecurityPanel({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
        <p className="eyebrow-sm text-ink-faint">Session active</p>
        <p className="truncate text-sm font-light text-ink">{email}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            await signOutAction();
            router.replace("/");
            router.refresh();
          })
        }
      >
        Fermer la session
      </Button>
    </div>
  );
}

/* ── Zone dangereuse ────────────────────────────────────────── */

export function DangerZone() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <p className="text-sm font-light leading-relaxed text-ink-soft">
        La suppression du compte efface définitivement votre profil, vos invitations, vos photos et
        votre historique. Les liens déjà partagés cesseront de fonctionner immédiatement.
      </p>
      <div className="mt-7">
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          Supprimer mon compte
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        loading={pending}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteAccountAction();
            setOpen(false);
            if (result.ok) {
              router.replace("/");
              router.refresh();
            } else {
              toast({ title: "Suppression impossible", description: result.message, tone: "danger" });
            }
          })
        }
        title="Supprimer votre compte ?"
        description="Tout disparaît : profil, invitations, photos, historique. Cette action ne peut pas être annulée."
        confirmLabel="Supprimer définitivement"
      />
    </>
  );
}
