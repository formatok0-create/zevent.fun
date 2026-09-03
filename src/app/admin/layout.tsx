import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/services/session";
import { Icone } from "@/components/ui/logo";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration Zevent" },
  robots: { index: false, follow: false },
};

/* La garde tient ici, une fois. `requireAdmin` renvoie vers /dashboard
   plutôt que vers une page d'erreur : un compte ordinaire n'apprend
   même pas que cette adresse existe. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="voix-cerise fond-cerise min-h-dvh">
      <header className="border-b border-line">
        <div className="shell flex items-center justify-between gap-4 py-4">
          <Link href="/admin" className="flex min-h-11 items-center gap-3">
            <Icone className="size-7" />
            <span className="font-display text-[1rem] font-semibold leading-none tracking-[0.24em]">
              ZEVENT
            </span>
            <span className="eyebrow-sm whitespace-nowrap border-l border-line-strong pl-2 text-gold">
              Admin
            </span>
          </Link>
          <Link href="/dashboard" className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-soft">
            ← Mon espace
          </Link>
        </div>
        <AdminNav />
      </header>

      <main className="shell py-10 sm:py-14">{children}</main>

      <footer className="shell border-t border-line py-6">
        <p className="eyebrow-sm text-ink-faint">Connecté en administrateur · {admin.email}</p>
      </footer>
    </div>
  );
}
