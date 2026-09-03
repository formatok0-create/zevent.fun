import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/demo/cookie";
import type { SessionUser } from "@/types/database";
import type { UserRole } from "@/types/admin";

/** Utilisateur courant, ou null. Jamais d’exception : les pages
 *  publiques appellent aussi cette fonction. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("user_id", data.user.id)
      .maybeSingle();

    return {
      id: data.user.id,
      email: data.user.email ?? "",
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  }

  const { db } = await import("@/lib/demo/store");
  const store = await cookies();
  const userId = store.get(DEMO_COOKIE)?.value;
  if (!userId) return null;

  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const profile = db.profiles.find((p) => p.user_id === userId);

  return {
    id: user.id,
    email: user.email,
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

/** À utiliser dans tout l’espace privé. Redirige si non connecté.
 *  Un compte bloqué est traité comme un compte absent : le blocage
 *  n'aurait aucun effet si la garde ne regardait que la session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login?session=expiree");
  if (await estBloque(user.id)) redirect("/login?compte=bloque");
  return user;
}

async function estBloque(userId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.status === "blocked";
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  return dbAdmin.statuts[userId] === "blocked";
}

/* ── Le rôle ────────────────────────────────────────────────────
   `requireAdmin` est la seule porte de /admin : les services
   d'administration ne revérifient pas, ils supposent qu'on est
   passé par ici. */

export async function getUserRole(userId: string): Promise<UserRole> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("user_id", userId)
      .maybeSingle();
    /* Un compte bloqué n'est plus administrateur, quel que soit son
       rôle : sinon un blocage laisserait la porte ouverte. */
    if (data?.status === "blocked") return "user";
    return (data?.role ?? "user") as UserRole;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  if (dbAdmin.statuts[userId] === "blocked") return "user";
  return dbAdmin.roles[userId] ?? "user";
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  return (await getUserRole(user.id)) === "admin";
}

/** À utiliser dans tout /admin. Un non-administrateur est renvoyé vers
 *  son espace, pas vers une page d'erreur : rien n'indique alors que
 *  l'adresse existe. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if ((await getUserRole(user.id)) !== "admin") redirect("/dashboard");
  return user;
}

export function displayName(user: SessionUser): string {
  return user.firstName?.trim() || user.email.split("@")[0] || "vous";
}

export function initials(user: SessionUser): string {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first) return `${first}${last ?? ""}`.toUpperCase();
  return (user.email[0] ?? "Z").toUpperCase();
}
