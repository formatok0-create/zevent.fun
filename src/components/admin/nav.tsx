"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ONGLETS = [
  { href: "/admin", label: "Vue d’ensemble" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/tarifs", label: "Tarifs" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="shell -mb-px flex gap-2 overflow-x-auto no-scrollbar pb-3">
      {ONGLETS.map((onglet) => {
        /* `/admin` est le préfixe de tout : sans l'égalité stricte,
           la vue d'ensemble resterait active sur chaque onglet. */
        const actif =
          onglet.href === "/admin" ? pathname === "/admin" : pathname.startsWith(onglet.href);
        return (
          <Link
            key={onglet.href}
            href={onglet.href}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "zv-maison inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[0.7rem] font-semibold uppercase transition-colors duration-400 ease-silk sm:px-5",
              actif
                ? "border-burgundy bg-burgundy text-white"
                : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {onglet.label}
          </Link>
        );
      })}
    </nav>
  );
}
