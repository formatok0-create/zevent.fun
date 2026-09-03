import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config";

/* ═══════════════════════════════════════════════════════════════
   LE CLIENT DE SERVICE

   Tout le reste de l'application parle à Supabase avec la clé
   anonyme et le cookie de session : c'est ce qu'on veut, RLS fait
   le tri. Deux endroits ne peuvent pas s'en contenter.

   1. `payment_settings` est réservée aux administrateurs. Un client
      normal qui arrive à l'étape de publication ne peut donc pas
      savoir quels moyens de paiement existent — la caisse était
      invisible pour tout le monde sauf l'administrateur.

   2. Un webhook n'a pas de session du tout. `auth.uid()` y vaut
      null, donc `est_admin(auth.uid())` vaut faux, donc la route
      lisait `null` dans `payment_settings` et répondait 404 à
      chaque notification de SasPay. Aucun paiement n'a jamais pu
      publier quoi que ce soit.

   La clé de service ignore RLS. Elle ne porte pas de préfixe
   `NEXT_PUBLIC_` : elle n'existe que sur le serveur, et
   `server-only` fait échouer le build si un composant client
   l'importe par accident.
   ═══════════════════════════════════════════════════════════════ */

function propre(valeur: string | undefined): string {
  return (valeur ?? "").trim().replace(/^["']|["']$/g, "").trim();
}

const cleDeService = propre(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const aCleDeService = Boolean(cleDeService && supabaseConfig.url);

/** Ignore RLS. À n'appeler que depuis un webhook ou une action qui a
 *  déjà vérifié à qui elle parle. */
export function createServiceSupabase() {
  if (!aCleDeService) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est absente : les paiements ne peuvent pas fonctionner.",
    );
  }
  return createClient(supabaseConfig.url, cleDeService, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "X-Client-Info": "zevent-service" } },
  });
}

/** Le client de service quand il existe, la session sinon. Permet aux
 *  lectures qui marchaient déjà (l'administration, par exemple) de
 *  continuer à marcher sans la clé. */
export async function createPrivilegedSupabase() {
  if (aCleDeService) return createServiceSupabase();
  const { createServerSupabase } = await import("./server");
  return createServerSupabase();
}
