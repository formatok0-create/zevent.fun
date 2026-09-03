"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/app/(auth)/actions";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validation/schemas";

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-3 border-l-2 border-danger bg-danger/5 px-4 py-3 text-xs font-light leading-relaxed text-danger">
      {message}
    </p>
  );
}

function FormNotice({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="flex items-start gap-3 border-l-2 border-gold bg-champagne-soft/50 px-4 py-3 text-xs font-light leading-relaxed text-brown">
      {message}
    </p>
  );
}

/* ── Connexion ──────────────────────────────────────────────── */

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await signInAction(values);
    if (!result.ok) {
      setServerError(result.message ?? null);
      return;
    }
    router.replace(params.get("next") ?? "/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <FormError message={serverError} />

      <Field label="Adresse e-mail" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...register("email")}
          />
        )}
      </Field>

      <Field label="Mot de passe" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...register("password")}
          />
        )}
      </Field>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="eyebrow-sm link-draw text-ink-soft hover:text-ink">
          Mot de passe oublié
        </Link>
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Se connecter
      </Button>
    </form>
  );
}

/* ── Création de compte ─────────────────────────────────────── */

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    /* `conditions` vaut `true` une fois validé, donc son type ne
       laisse pas écrire `false` en valeur par défaut. On décrit ici le
       formulaire tel qu'il est *avant* validation. */
  } = useForm<SignUpValues, unknown, SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" } as unknown as SignUpValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setNotice(null);
    const result = await signUpAction(values);
    if (!result.ok) {
      setServerError(result.message ?? null);
      return;
    }
    if (result.message) {
      setNotice(result.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <FormError message={serverError} />
      <FormNotice message={notice} />

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Prénom" error={errors.firstName?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="given-name" placeholder="Cheick" aria-invalid={invalid} aria-describedby={describedBy} {...register("firstName")} />
          )}
        </Field>
        <Field label="Nom" optional error={errors.lastName?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="family-name" placeholder="Traoré" aria-invalid={invalid} aria-describedby={describedBy} {...register("lastName")} />
          )}
        </Field>
      </div>

      <Field label="Adresse e-mail" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="email" autoComplete="email" placeholder="vous@exemple.com" aria-invalid={invalid} aria-describedby={describedBy} {...register("email")} />
        )}
      </Field>

      <Field label="Mot de passe" hint="Au moins 8 caractères." error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" placeholder="••••••••" aria-invalid={invalid} aria-describedby={describedBy} {...register("password")} />
        )}
      </Field>

      {/* L'acceptation est un acte explicite : une case à cocher, non
          pré-cochée, avec les liens vers les textes eux-mêmes. Une
          simple phrase sous le bouton ne vaut pas consentement. */}
      <div className="grid gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-xs font-light leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            {...register("conditions")}
            aria-invalid={errors.conditions ? true : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-burgundy)]"
          />
          <span>
            J’ai lu et j’accepte les{" "}
            <Link href="/conditions-generales" target="_blank" className="link-draw text-burgundy">
              conditions générales de vente
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="link-draw text-burgundy">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.conditions?.message && (
          <p role="alert" className="text-xs font-light text-danger">
            {errors.conditions.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Créer mon compte
      </Button>

      <p className="text-xs font-light leading-relaxed text-ink-faint">
        Vos invitations publiées sont accessibles à toute personne disposant du lien.
      </p>
    </form>
  );
}

/* ── Mot de passe oublié ────────────────────────────────────── */

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async (values) => {
    const result = await forgotPasswordAction(values);
    setNotice(result.message ?? null);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <FormNotice message={notice} />

      <Field label="Adresse e-mail" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="email" autoComplete="email" placeholder="vous@exemple.com" aria-invalid={invalid} aria-describedby={describedBy} {...register("email")} />
        )}
      </Field>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Envoyer le lien
      </Button>
    </form>
  );
}

/* ── Nouveau mot de passe ───────────────────────────────────── */

export function ResetPasswordForm() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string; confirm: string }>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await resetPasswordAction(values);
    if (!result.ok) {
      setServerError(result.message ?? null);
      return;
    }
    setNotice(result.message ?? null);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1400);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <FormError message={serverError} />
      <FormNotice message={notice} />

      <Field label="Nouveau mot de passe" hint="Au moins 8 caractères." error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} {...register("password")} />
        )}
      </Field>

      <Field label="Confirmation" error={errors.confirm?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} {...register("confirm")} />
        )}
      </Field>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
