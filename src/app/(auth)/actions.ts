"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/config";
import { getSiteUrl } from "@/lib/site-url";
import { createServerSupabase } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/demo/cookie";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/schemas";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/* En production, l'absence de Supabase ne doit pas passer inaperçue :
   sans ces variables, l'application bascule sur le magasin de
   démonstration et aucun compte réel ne peut exister. */
const EN_PRODUCTION = process.env.VERCEL_ENV === "production";

function baseAbsente(): ActionResult {
  console.error(
    "[auth] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manque en production. " +
      "Vérifiez la portée des variables dans Vercel, puis redéployez : les variables NEXT_PUBLIC_ " +
      "sont figées au moment du build.",
  );
  return {
    ok: false,
    message:
      "Le site n’est pas relié à sa base de données. Ouvrez /api/sante pour voir ce qui manque.",
  };
}

/** Messages lisibles : jamais l’erreur brute du fournisseur — mais
 *  elle part dans les journaux, sinon le vrai motif se perd. */
function humanize(raw: string | undefined): string {
  if (!raw) return "La connexion a échoué. Réessayez dans un instant.";
  const message = raw.toLowerCase();
  if (message.includes("invalid login")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("already registered") || message.includes("already been registered"))
    return "Un compte existe déjà avec cette adresse. Connectez-vous.";
  if (message.includes("email not confirmed"))
    return "Confirmez votre adresse e-mail avant de vous connecter.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Trop de tentatives. Patientez une minute avant de réessayer.";
  return "Une erreur est survenue. Réessayez dans un instant.";
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Vérifiez les informations saisies." };
  const { email, password } = parsed.data;

  if (!isSupabaseConfigured && EN_PRODUCTION) return baseAbsente();

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[auth] connexion refusée :", error.status, error.message);
      return { ok: false, message: humanize(error.message) };
    }
  } else {
    const { db } = await import("@/lib/demo/store");
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, message: "E-mail ou mot de passe incorrect." };
    }
    (await cookies()).set(DEMO_COOKIE, user.id, COOKIE_OPTIONS);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Vérifiez les informations saisies." };
  const { email, password, firstName, lastName } = parsed.data;

  if (!isSupabaseConfigured && EN_PRODUCTION) return baseAbsente();

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName ?? "" },
        emailRedirectTo: `${await getSiteUrl()}/auth/callback`,
      },
    });
    if (error) {
      console.error("[auth] inscription refusée :", error.status, error.message);
      return { ok: false, message: humanize(error.message) };
    }
    if (!data.session) {
      return {
        ok: true,
        message: "Vérifiez votre boîte mail : un lien de confirmation vous attend.",
      };
    }
  } else {
    const { db, uid } = await import("@/lib/demo/store");
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "Un compte existe déjà avec cette adresse." };
    }
    const id = uid("user");
    db.users.push({ id, email, password });
    db.profiles.push({
      id: uid("profile"),
      user_id: id,
      first_name: firstName,
      last_name: lastName || null,
      avatar_url: null,
      locale: "fr",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    (await cookies()).set(DEMO_COOKIE, id, COOKIE_OPTIONS);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Cette adresse e-mail n’est pas valide." };

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${await getSiteUrl()}/auth/callback?next=/reset-password`,
    });
  }

  /* Réponse volontairement identique dans tous les cas : on ne
     révèle jamais si une adresse possède un compte. */
  return {
    ok: true,
    message: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.",
  };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Les deux mots de passe ne correspondent pas." };

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { ok: false, message: humanize(error.message) };
  }

  return { ok: true, message: "Votre mot de passe a été mis à jour." };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } else {
    (await cookies()).delete(DEMO_COOKIE);
  }
  revalidatePath("/", "layout");
}
