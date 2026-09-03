import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    return (data as Profile) ?? null;
  }
  const { db } = await import("@/lib/demo/store");
  return db.profiles.find((p) => p.user_id === userId) ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "first_name" | "last_name" | "avatar_url" | "locale">>,
): Promise<Profile> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  }

  const { db } = await import("@/lib/demo/store");
  const index = db.profiles.findIndex((p) => p.user_id === userId);
  if (index === -1) throw new Error("Profil introuvable");
  db.profiles[index] = { ...db.profiles[index], ...patch, updated_at: new Date().toISOString() };
  return db.profiles[index];
}
