import type { Invitation, InvitationProduct } from "@/types/database";

/** La route publique dépend du produit. Le slug, lui, est unique
 *  toutes invitations confondues : deux produits ne peuvent pas se
 *  disputer la même adresse. */
export function publicPathFor(
  invitation: Pick<Invitation, "product" | "slug"> & Partial<Pick<Invitation, "celebrant_name">>,
  fallback = "votre-lien",
): string {
  /* Meme deduction que cote service : un prenom de celebrant suffit
     a reconnaitre un anniversaire, meme si la colonne product est
     absente parce que la migration n'a pas encore ete jouee. */
  const segment: InvitationProduct =
    invitation.product ?? (invitation.celebrant_name?.trim() ? "anniversaire" : "mariage");
  return `/${segment}/${invitation.slug ?? fallback}`;
}
