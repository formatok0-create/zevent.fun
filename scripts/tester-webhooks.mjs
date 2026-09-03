#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   TESTER LES WEBHOOKS DE PAIEMENT SANS TUNNEL PUBLIC

   Les deux fournisseurs n'atteindront jamais localhost. Ce script
   fabrique des webhooks correctement signés et les poste sur votre
   application, exactement comme SasPay et Chariow le feraient.

   Usage :
     node scripts/tester-webhooks.mjs saspay  <secret> [url]
     node scripts/tester-webhooks.mjs chariow <secret> [url]

   Le secret est celui que vous avez saisi dans /admin/paiements.
   L'url par defaut est http://localhost:3000
   ═══════════════════════════════════════════════════════════════ */

import { createHmac } from "node:crypto";

const [fournisseur, secret, base = "http://localhost:3000"] = process.argv.slice(2);

if (!fournisseur || !secret) {
  console.error("Usage : node scripts/tester-webhooks.mjs <saspay|chariow> <secret> [url]");
  process.exit(1);
}

/* Le corps est fige en chaine : c'est sur ces octets exacts que la
   signature est calculee, et c'est eux qu'on envoie. Re-serialiser
   apres coup casserait la comparaison. */
const CORPS = {
  saspay: JSON.stringify({
    event: "transaction.success",
    data: {
      id: "txn_test_0001",
      reference: "TXN-TEST-0001",
      type: "PAIEMENT",
      status: "SUCCESS",
      amount: "15000.00",
      fee: "375.00",
      charged: "15375.00",
      net_amount: "15000.00",
      fee_charge_mode: "ADD_ON",
      currency: "XOF",
      country: "CI",
      network: "mtn_ci",
      msisdn: "22500000000",
    },
  }),
  chariow: JSON.stringify({
    data: {
      id: "sal_test_0001",
      status: "completed",
      amount: { value: 15000, formatted: "15 000 F", short: "15k", currency: "XOF" },
      custom_metadata: { zevent_reference: "ref-test-0001" },
    },
  }),
};

async function poster(titre, chemin, corps, entetes) {
  let reponse;
  try {
    reponse = await fetch(base + chemin, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...entetes },
      body: corps,
    });
  } catch {
    /* Un `fetch failed` brut avec sa pile Node n'aide personne : la
       cause est presque toujours que le serveur ne tourne pas. */
    console.error(`\n  Impossible de joindre ${base}. L'application est-elle lancée (npm run dev) ?\n`);
    process.exit(1);
  }
  const texte = await reponse.text();
  const verdict =
    reponse.status === 200
      ? "✓"
      : reponse.status === 401
        ? "✗ refusé"
        : reponse.status === 404
          ? "· coupé"
          : "?";
  console.log(`  ${verdict}  ${titre.padEnd(34)} ${reponse.status}  ${texte.slice(0, 60)}`);
  if (reponse.status === 404) {
    console.log("        → ce fournisseur est désactivé dans /admin/paiements.");
  }
}

if (fournisseur === "saspay") {
  const corps = CORPS.saspay;
  const chemin = "/api/paiements/saspay/webhook";
  const signer = (ts) => createHmac("sha256", secret).update(`${ts}.${corps}`).digest("hex");
  const maintenant = Math.floor(Date.now() / 1000);

  console.log(`\nSasPay → ${base}${chemin}\n`);
  await poster("signature valide", chemin, corps, {
    "X-Webhook-Signature": signer(maintenant),
    "X-Webhook-Timestamp": String(maintenant),
    "X-Webhook-Event": "transaction.success",
  });
  await poster("mauvais secret", chemin, corps, {
    "X-Webhook-Signature": createHmac("sha256", "mauvais").update(`${maintenant}.${corps}`).digest("hex"),
    "X-Webhook-Timestamp": String(maintenant),
    "X-Webhook-Event": "transaction.success",
  });
  const vieux = maintenant - 900;
  await poster("horodatage vieux de 15 min", chemin, corps, {
    "X-Webhook-Signature": signer(vieux),
    "X-Webhook-Timestamp": String(vieux),
    "X-Webhook-Event": "transaction.success",
  });
  await poster("sans en-tête de signature", chemin, corps, {});
} else if (fournisseur === "chariow") {
  const corps = CORPS.chariow;
  const chemin = "/api/paiements/chariow/pulse";
  const signature = "sha256=" + createHmac("sha256", secret).update(corps).digest("hex");

  console.log(`\nChariow → ${base}${chemin}\n`);
  await poster("signature valide", chemin, corps, {
    "x-chariow-signature": signature,
    "x-pulse-event": "successful.sale",
    "x-pulse-delivery-id": "dlv_test_0001",
  });
  await poster("rejeu de la même livraison", chemin, corps, {
    "x-chariow-signature": signature,
    "x-pulse-event": "successful.sale",
    "x-pulse-delivery-id": "dlv_test_0001",
  });
  await poster("mauvais secret", chemin, corps, {
    "x-chariow-signature": "sha256=" + createHmac("sha256", "mauvais").update(corps).digest("hex"),
    "x-pulse-event": "successful.sale",
    "x-pulse-delivery-id": "dlv_test_0002",
  });
  await poster("préfixe d'algorithme inconnu", chemin, corps, {
    "x-chariow-signature": "sha512=" + createHmac("sha512", secret).update(corps).digest("hex"),
    "x-pulse-event": "successful.sale",
    "x-pulse-delivery-id": "dlv_test_0003",
  });
} else {
  console.error(`Fournisseur inconnu : ${fournisseur}`);
  process.exit(1);
}

console.log(
  "\nUn 200 signifie que la signature est acceptée. Le paiement n'est mis à jour\n" +
    "que s'il existe déjà en base avec cette référence — sinon la route répond 200\n" +
    "sans rien faire, pour ne pas déclencher les cinq tentatives du fournisseur.\n",
);
