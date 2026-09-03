import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { InvitationHistoryEntry } from "@/types/database";

export interface HistoryEntryView extends InvitationHistoryEntry {
  invitationTitle: string | null;
}

export async function listHistory(userId: string, limit = 60): Promise<HistoryEntryView[]> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("invitation_history")
      .select("*, invitations(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return (data ?? []).map((row) => {
      const { invitations, ...entry } = row as InvitationHistoryEntry & {
        invitations: { title: string | null } | null;
      };
      return {
        ...entry,
        invitationTitle:
          invitations?.title ?? (entry.metadata?.title as string | undefined) ?? null,
      };
    });
  }

  const { db } = await import("@/lib/demo/store");
  return db.history
    .filter((h) => h.user_id === userId)
    .slice(0, limit)
    .map((entry) => ({
      ...entry,
      invitationTitle:
        db.invitations.find((i) => i.id === entry.invitation_id)?.title ??
        (entry.metadata?.title as string | undefined) ??
        null,
    }));
}

/** Libellés humains — jamais de code technique affiché à l’écran. */
export const HISTORY_LABELS: Record<string, { title: string; note: string }> = {
  "invitation.created": { title: "Invitation créée", note: "Le brouillon a été ouvert." },
  "invitation.updated": { title: "Invitation modifiée", note: "Les informations ont été enregistrées." },
  "invitation.published": { title: "Invitation publiée", note: "Le lien est accessible à vos invités." },
  "invitation.unpublished": { title: "Invitation dépubliée", note: "Le lien ne répond plus." },
  "invitation.duplicated": { title: "Invitation dupliquée", note: "Une copie a été ajoutée à vos invitations." },
  "invitation.deleted": { title: "Invitation supprimée", note: "Elle a quitté votre espace." },
};
