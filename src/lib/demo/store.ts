import type {
  HistoryAction,
  Invitation,
  InvitationHistoryEntry,
  InvitationPhoto,
  Profile,
} from "@/types/database";

/* ═══════════════════════════════════════════════════════════════
   MODE DEMONSTRATION
   Actif uniquement quand NEXT_PUBLIC_SUPABASE_URL est absent.
   Tout vit en memoire : `npm run dev` fonctionne sans backend.

   POUR SUPPRIMER LES DONNEES DE DEMONSTRATION :
   renseignez les variables Supabase dans .env.local — ce fichier
   n’est alors plus jamais importe par les services. Pour un vide
   total en mode demo, videz simplement SEED_INVITATIONS ci-dessous.
   ═══════════════════════════════════════════════════════════════ */

export interface DemoUser {
  id: string;
  email: string;
  password: string;
}

interface DemoDatabase {
  users: DemoUser[];
  profiles: Profile[];
  invitations: Invitation[];
  photos: InvitationPhoto[];
  history: InvitationHistoryEntry[];
}

const now = () => new Date().toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export const DEMO_ACCOUNT = { email: "demo@zevent.fun", password: "zevent2026" };

const DEMO_USER_ID = "demo-user-0001";

const SEED_INVITATIONS: Invitation[] = [
  {
    id: "inv-aicha-yassine",
    user_id: DEMO_USER_ID,
    product: "mariage",
    type: "musulman",
    template_id: "zellige",
    slug: "aicha-et-yassine",
    title: "Aïcha & Yassine",
    groom_name: "Yassine",
    bride_name: "Aïcha",
    wedding_date: "2026-12-12",
    wedding_time: "16:00",
    venue: "Palais de la Culture",
    address: "Boulevard Valéry Giscard d’Estaing, Treichville, Abidjan",
    description:
      "Nous serions honorés de votre présence pour célébrer notre union, entourés de nos familles.",
    story:
      "Nous nous sommes croisés un mardi de juillet, dans la file d’une librairie de Cocody. Yassine tenait un recueil de Senghor, Aïcha attendait son thé. Trois ans plus tard, la même impatience, la même file, et une promesse.",
    music_url: null,
    music_title: "Ambiance kora — instrumental",
    cover_image_url: null,
    bride_family: "Koné",
    groom_family: "Diallo",
    bride_photo_url: null,
    groom_photo_url: null,
    events: [
      { kind: "religieux", date: "2026-12-12", time: "16:00", venue: "Mosquée de la Riviera", address: "Riviera 3, Cocody, Abidjan" },
      { kind: "civil", date: "2026-12-11", time: "10:00", venue: "Mairie de Cocody", address: "Boulevard Latrille, Abidjan" },
      { kind: "walima", date: "2026-12-12", time: "20:00", venue: "Palais de la Culture", address: "Treichville, Abidjan" },
    ],
    program: [
      { time: "16h00", title: "Cérémonie", note: "Palais de la Culture" },
      { time: "18h30", title: "Cocktail", note: "Jardin sud" },
      { time: "21h00", title: "Dîner et soirée" },
    ],
    status: "published",
    created_at: ago(46),
    updated_at: ago(3),
    published_at: ago(12),
    paid_at: null,
    plan_code: null,
    expires_at: null,
  },
  {
    id: "inv-emma-nathan",
    user_id: DEMO_USER_ID,
    product: "mariage",
    type: "chretien",
    template_id: "dolce",
    slug: null,
    title: "Emma & Nathan",
    groom_name: "Nathan",
    bride_name: "Emma",
    wedding_date: "2027-04-18",
    wedding_time: "14:30",
    venue: "Domaine de la Roseraie",
    address: "Route des Vignes, Aix-en-Provence",
    description: "Une journée simple, en plein air, avec ceux que nous aimons.",
    story: null,
    music_url: null,
    music_title: null,
    cover_image_url: null,
    bride_family: "Laurent",
    groom_family: "Mercier",
    bride_photo_url: null,
    groom_photo_url: null,
    events: [
      { kind: "coutumier", date: "2027-04-16", time: "11:00", venue: "Résidence Laurent", address: "Riviera Golf, Abidjan" },
      { kind: "civil", date: "2027-04-17", time: "10:30", venue: "Mairie de Cocody", address: "Boulevard Latrille, Abidjan" },
      { kind: "religieux", date: "2027-04-18", time: "14:30", venue: "Paroisse Saint-Jean", address: "Cocody, Abidjan" },
    ],
    program: null,
    status: "draft",
    created_at: ago(9),
    updated_at: ago(1),
    published_at: null,
    paid_at: null,
    plan_code: null,
    expires_at: null,
  },
  /* ── L'anniversaire : le second produit, avec son album ── */
  {
    id: "inv-adrian-7",
    user_id: DEMO_USER_ID,
    product: "anniversaire",
    type: null,
    template_id: "royaume",
    slug: "adrian-7-ans",
    title: "Adrian — 7 ans",
    groom_name: null,
    bride_name: null,
    celebrant_name: "Adrian",
    celebrant_age: 7,
    album: [
      { year: 2020, age: 1, url: null, caption: "Premiers pas" },
      { year: 2021, age: 2, url: null, caption: "La plage" },
      { year: 2022, age: 3, url: null, caption: "Le vélo" },
      { year: 2023, age: 4, url: null, caption: "L’école" },
      { year: 2024, age: 5, url: null, caption: "Le maillot" },
      { year: 2025, age: 6, url: null, caption: "La cabane" },
      { year: 2026, age: 7, url: null, caption: "Le grand" },
    ],
    wedding_date: "2026-10-10",
    wedding_time: "15:00",
    venue: "Jardin de la Riviera",
    address: "Riviera Golf, Cocody, Abidjan",
    description: "Vous êtes invité",
    story: "Sept ans déjà. Venez souffler les bougies avec nous, et prévoyez des baskets : il y aura une chasse au trésor.",
    music_url: null,
    music_title: null,
    cover_image_url: null,
    bride_family: null,
    groom_family: null,
    bride_photo_url: null,
    groom_photo_url: null,
    events: null,
    program: [
      { time: "15:00", title: "Accueil", note: "Jeux dans le jardin" },
      { time: "16:30", title: "Le gâteau", note: "Sept bougies" },
      { time: "18:00", title: "Départ", note: "Chacun repart avec sa pochette" },
    ],
    status: "published",
    created_at: ago(6),
    updated_at: ago(2),
    published_at: ago(2),
    paid_at: null,
    plan_code: null,
    expires_at: null,
  },
];

const SEED_HISTORY: Array<Omit<InvitationHistoryEntry, "id">> = [
  { invitation_id: "inv-aicha-yassine", user_id: DEMO_USER_ID, action: "invitation.created", metadata: { title: "Aïcha & Yassine" }, created_at: ago(46) },
  { invitation_id: "inv-aicha-yassine", user_id: DEMO_USER_ID, action: "invitation.updated", metadata: { fields: ["story"] }, created_at: ago(30) },
  { invitation_id: "inv-aicha-yassine", user_id: DEMO_USER_ID, action: "invitation.published", metadata: { slug: "aicha-et-yassine" }, created_at: ago(12) },
  { invitation_id: "inv-emma-nathan", user_id: DEMO_USER_ID, action: "invitation.created", metadata: { title: "Emma & Nathan" }, created_at: ago(9) },
  { invitation_id: "inv-emma-nathan", user_id: DEMO_USER_ID, action: "invitation.updated", metadata: { fields: ["venue", "wedding_time"] }, created_at: ago(1) },
];

function seed(): DemoDatabase {
  return {
    users: [{ id: DEMO_USER_ID, email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password }],
    profiles: [
      {
        id: "profile-demo",
        user_id: DEMO_USER_ID,
        first_name: "Cheick",
        last_name: "Traoré",
        avatar_url: null,
        locale: "fr",
        created_at: ago(46),
        updated_at: ago(3),
      },
    ],
    invitations: SEED_INVITATIONS.map((i) => ({ ...i })),
    photos: [],
    history: SEED_HISTORY.map((h, index) => ({ ...h, id: `history-${index}` })),
  };
}

/* Survit au hot reload de Next en développement. */
const globalRef = globalThis as unknown as { __zeventDemo?: DemoDatabase };
export const db: DemoDatabase = (globalRef.__zeventDemo ??= seed());

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function pushHistory(
  userId: string,
  invitationId: string | null,
  action: HistoryAction,
  metadata: Record<string, unknown> = {},
) {
  db.history.unshift({
    id: uid("history"),
    invitation_id: invitationId,
    user_id: userId,
    action,
    metadata,
    created_at: now(),
  });
}

/* ═══════════════════════════════════════════════════════════════
   ADMINISTRATION ET PAIEMENTS — mode demonstration
   Les memes formes qu'en base, en memoire. Le compte de
   demonstration est administrateur : sans lui, /admin serait
   inatteignable tant que Supabase n'est pas configure.
   ═══════════════════════════════════════════════════════════════ */

export interface DemoAdminState {
  roles: Record<string, "user" | "admin">;
  statuts: Record<string, "active" | "blocked">;
  reglages: import("@/types/admin").PaymentProviderSettings[];
  plans: import("@/types/admin").Plan[];
  paiements: import("@/types/admin").Payment[];
}

/* Le mariage a un prix unique, l'anniversaire un par tranche d'âge. */
function plan(
  id: string, code: string, name: string, description: string,
  amount: number, sort_order: number, t: string,
): import("@/types/admin").Plan {
  return { id, code, name, description, amount, currency: "XOF", chariow_product_id: null, active: true, sort_order, created_at: t, updated_at: t };
}

function seedAdmin(): DemoAdminState {
  const t = now();
  return {
    roles: { [DEMO_USER_ID]: "admin" },
    statuts: { [DEMO_USER_ID]: "active" },
    reglages: [
      {
        provider: "saspay",
        enabled: false,
        environment: "test",
        api_key: null,
        webhook_secret: null,
        product_id: null,
        updated_at: t,
      },
      {
        provider: "chariow",
        enabled: false,
        environment: "test",
        api_key: null,
        webhook_secret: null,
        product_id: null,
        updated_at: t,
      },
    ],
    plans: [
      plan("plan-mariage", "mariage", "Invitation mariage", "Une invitation de mariage, dix collections, lien à vie.", 5000, 1, t),
      plan("plan-ann-enfant", "anniversaire-enfant", "Anniversaire · 1 à 10 ans", "Huit collections : champignons, licornes, éclairs, arcs-en-ciel.", 3500, 10, t),
      plan("plan-ann-jeune-ado", "anniversaire-jeune-ado", "Anniversaire · 11 à 14 ans", "Arène, Voltage, Nuit bleue — le même soin, en plus moderne.", 4000, 11, t),
      plan("plan-ann-ado", "anniversaire-ado", "Anniversaire · 15 à 17 ans", "Velours rose, Bitume, Perle.", 4500, 12, t),
      plan("plan-ann-adulte", "anniversaire-adulte", "Anniversaire · 18 ans et +", "Smoking, Rubis, Château — la fête des grands.", 5000, 13, t),
    ],
    paiements: [],
  };
}

const adminRef = globalThis as unknown as { __zeventAdmin?: DemoAdminState };
export const dbAdmin: DemoAdminState = (adminRef.__zeventAdmin ??= seedAdmin());
