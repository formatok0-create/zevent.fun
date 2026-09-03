/* ═══════════════════════════════════════════════════════════════
   ADMINISTRATION ET PAIEMENTS
   ═══════════════════════════════════════════════════════════════ */

/** Un compte ordinaire ne voit jamais /admin. */
export type UserRole = "user" | "admin";

/** `blocked` coupe l'acces sans effacer les invitations : on peut
 *  revenir en arriere, ce qu'une suppression ne permet pas. */
export type UserStatus = "active" | "blocked";

export type PaymentProviderId = "saspay" | "chariow";

export type PaymentEnvironment = "test" | "live";

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

/** La configuration d'un fournisseur, telle qu'elle est editee dans
 *  l'administration. Les secrets ne quittent jamais le serveur. */
export interface PaymentProviderSettings {
  provider: PaymentProviderId;
  enabled: boolean;
  environment: PaymentEnvironment;
  /** Cle secrete d'API (`sk_live_...` / `sk_test_...`). */
  api_key: string | null;
  /** Secret de signature des webhooks — SasPay le nomme
   *  `signing_secret`, Chariow `whsec_...`. Meme role, deux schemas. */
  webhook_secret: string | null;
  /** Chariow vend des produits : un paiement pointe vers un produit
   *  de la boutique. SasPay encaisse un montant libre, ce champ ne le
   *  concerne pas. */
  product_id: string | null;
  updated_at: string;
}

/** Un tarif du SaaS, editable depuis l'administration. */
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  /** En unite entiere de la devise — 5000 XOF, pas 50.00. Le franc
   *  CFA n'a pas de centimes, et stocker un entier evite les erreurs
   *  d'arrondi que les flottants introduisent. */
  amount: number;
  currency: string;
  /** Chariow vend un produit a son prix, pas un montant libre :
   *  chaque tarif pointe donc vers son propre produit dans la
   *  boutique. Null si Chariow ne sert pas pour ce tarif. */
  chariow_product_id: string | null;
  /** Un produit desactive n'est plus proposable a l'achat, mais les
   *  paiements passes gardent leur reference. */
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string | null;
  invitation_id: string | null;
  plan_id: string | null;
  provider: PaymentProviderId;
  /** Identifiant cote fournisseur : session de checkout SasPay ou
   *  vente Chariow. */
  provider_reference: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  checkout_url: string | null;
  /** Cle de deduplication des webhooks : `x-pulse-delivery-id` chez
   *  Chariow, l'identifiant de transaction chez SasPay. */
  last_event_id: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

/** Une ligne de la liste des utilisateurs de l'administration. */
export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  invitations: number;
  published: number;
  createdAt: string;
  lastSeenAt: string | null;
}
