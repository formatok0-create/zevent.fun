import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";
import { isAdmin, requireUser } from "@/lib/services/session";

export const metadata: Metadata = {
  title: { default: "Mon espace", template: "%s · Zevent" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  /* Le lien n'apparaît que pour un administrateur, mais ce n'est pas
     lui qui protège /admin — c'est `requireAdmin` dans son layout. */
  const admin = await isAdmin();
  return (
    <DashboardShell user={user} admin={admin}>
      {children}
    </DashboardShell>
  );
}
