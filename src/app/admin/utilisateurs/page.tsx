import { listUsers } from "@/lib/services/admin";
import { getSessionUser } from "@/lib/services/session";
import { UserRow } from "@/components/admin/user-row";

export const metadata = { title: "Utilisateurs" };

export default async function AdminUtilisateurs() {
  const [utilisateurs, moi] = await Promise.all([listUsers(), getSessionUser()]);
  const bloques = utilisateurs.filter((u) => u.status === "blocked").length;

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <p className="eyebrow text-gold">Comptes</p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,2.8rem)]">Utilisateurs</h1>
        <p className="text-sm font-light text-ink-soft">
          {utilisateurs.length} compte{utilisateurs.length > 1 ? "s" : ""}
          {bloques > 0 && ` · ${bloques} bloqué${bloques > 1 ? "s" : ""}`}
        </p>
      </header>

      {utilisateurs.length === 0 ? (
        <p className="border-y border-line py-16 text-center text-sm font-light text-ink-soft">
          Aucun compte pour le moment.
        </p>
      ) : (
        <ul className="grid gap-3">
          {utilisateurs.map((utilisateur) => (
            <UserRow key={utilisateur.id} utilisateur={utilisateur} estMoi={moi?.id === utilisateur.id} />
          ))}
        </ul>
      )}
    </div>
  );
}
