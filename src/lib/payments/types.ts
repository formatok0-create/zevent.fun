import "server-only";
import type {
  PaymentProviderId,
  PaymentProviderSettings,
} from "@/types/admin";

/* Ce qu'on demande a un fournisseur : ouvrir une page de paiement, et
   savoir lire ce qu'il renvoie quand le client a paye. Le reste — les
   soldes, les retraits, les licences — ne concerne pas Zevent. */

export interface CheckoutDemande {
  /** En unite entiere de la devise. */
  montant: number;
  devise: string;
  libelle: string;
  client: { email: string; prenom: string; nom: string; telephone?: string };
  /** Ou renvoyer le client apres le paiement. */
  retourUrl: string;
  /** Remonte dans le webhook : c'est ce qui rattache un paiement a une
   *  invitation sans avoir a faire confiance au montant. */
  reference: string;
  /** Le produit Chariow correspondant au tarif choisi. Ignore par les
   *  fournisseurs qui encaissent un montant libre. */
  produitId?: string | null;
}

export interface CheckoutReponse {
  /** Identifiant cote fournisseur, a stocker pour rapprocher. */
  reference: string;
  /** Null si le fournisseur a conclu sans paiement (produit gratuit). */
  url: string | null;
}

/** Le resultat de la lecture d'un webhook. `null` en cas de signature
 *  invalide — l'appelant repond alors 401 sans rien traiter. */
export interface EvenementPaiement {
  /** Cle de deduplication : le meme evenement peut arriver cinq fois. */
  evenementId: string;
  type: string;
  reference: string | null;
  statut: "pending" | "success" | "failed" | "cancelled";
  montant: number | null;
  devise: string | null;
  /** Ce que Zevent avait mis dans `reference` a la creation. */
  metadonnee: string | null;
}

export interface FournisseurPaiement {
  id: PaymentProviderId;
  nom: string;
  /** Ouvre une page de paiement hebergee. */
  checkout(
    config: PaymentProviderSettings,
    demande: CheckoutDemande,
  ): Promise<CheckoutReponse>;
  /** Verifie la signature ET lit l'evenement. Les deux vont ensemble :
   *  separer les deux invite a lire le corps avant de l'avoir verifie. */
  lireWebhook(
    config: PaymentProviderSettings,
    corpsBrut: string,
    entetes: Headers,
  ): EvenementPaiement | null;
  /** Redemande au fournisseur l'etat reel d'une session, par son
   *  identifiant. C'est ce qui permet de conclure au retour du client
   *  sans attendre le webhook, et sans jamais croire le navigateur.
   *  Optionnel : un fournisseur sans endpoint de lecture n'en a pas. */
  verifier?(
    config: PaymentProviderSettings,
    reference: string,
  ): Promise<{ paye: boolean; statut: string; montant: number | null }>;
}

/** Test ou production ? SasPay et Chariow ne changent pas d'URL : ils
 *  distinguent les deux par le prefixe de la cle. Une cle `sk_live_`
 *  posee dans un reglage marque « test » encaisse pour de vrai — le
 *  menu deroulant de l'administration ne protege de rien tout seul. */
export function coherenceCle(
  cle: string,
  environnement: "test" | "live",
): { ok: true } | { ok: false; message: string } {
  const c = cle.trim();
  const estTest = c.startsWith("sk_test_");
  const estLive = c.startsWith("sk_live_");

  if (!estTest && !estLive) {
    return {
      ok: false,
      message:
        "La clé ne commence ni par sk_test_ ni par sk_live_. Reprenez-la dans " +
        "le tableau de bord du fournisseur, section Développeur.",
    };
  }
  if (environnement === "test" && estLive) {
    return {
      ok: false,
      message:
        "Cette clé est une clé de PRODUCTION (sk_live_) alors que le réglage " +
        "est en mode Test : les paiements seraient réels. Prenez la clé " +
        "sk_test_, ou basculez le réglage en Production.",
    };
  }
  if (environnement === "live" && estTest) {
    return {
      ok: false,
      message:
        "Cette clé est une clé de test (sk_test_) alors que le réglage est en " +
        "Production : aucun paiement n'aboutirait vraiment.",
    };
  }
  return { ok: true };
}

/** Comparaison a temps constant. Un `===` s'arrete au premier
 *  caractere different : le temps de reponse laisse alors fuiter, octet
 *  par octet, la signature attendue. */
export function egaliteConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let ecart = 0;
  for (let i = 0; i < a.length; i += 1) ecart |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ecart === 0;
}
