import "server-only";
import { saspay } from "./saspay";
import { chariow } from "./chariow";
import type { FournisseurPaiement } from "./types";
import type { PaymentProviderId } from "@/types/admin";

export const FOURNISSEURS: Record<PaymentProviderId, FournisseurPaiement> = {
  saspay,
  chariow,
};

export const ORDRE_FOURNISSEURS: PaymentProviderId[] = ["saspay", "chariow"];

export function fournisseur(id: PaymentProviderId): FournisseurPaiement {
  return FOURNISSEURS[id];
}

export type { CheckoutDemande, CheckoutReponse, EvenementPaiement } from "./types";
