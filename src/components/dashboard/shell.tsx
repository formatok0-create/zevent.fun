"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Logo, Icone } from "@/components/ui/logo";
import { signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/types/database";

const PRIMARY = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/invitations", label: "Mes invitations" },
  { href: "/dashboard/invitations/new", label: "Créer une invitation" },
];

const SECONDARY = [
  { href: "/dashboard/history", label: "Historique" },
  { href: "/dashboard/settings", label: "Paramètres" },
];

/* Ajouté aux liens secondaires pour un administrateur seulement. */
const ADMIN_LIEN = { href: "/admin", label: "Administration" };

const ALL_HREFS = [...PRIMARY, ...SECONDARY].map((item) => item.href);

/** Une seule entrée peut être active : celle dont le chemin est le
 *  préfixe le plus long. Sans cela, « Mes invitations » et
 *  « Créer une invitation » s’allumeraient ensemble. */
function isActive(pathname: string, href: string) {
  const matches = (candidate: string) =>
    pathname === candidate || pathname.startsWith(`${candidate}/`);

  if (!matches(href)) return false;

  const best = ALL_HREFS.filter(matches).sort((a, b) => b.length - a.length)[0];
  return best === href;
}

function NavList({
  items,
  onNavigate,
  taille = "rail",
}: {
  items: typeof PRIMARY;
  onNavigate?: () => void;
  /* Le rail lateral vit en capitales fines, sur toute la hauteur de
     l'ecran. Le tiroir du telephone n'a que huit lignes : elles
     doivent se lire d'un coup d'oeil et se toucher au pouce. */
  taille?: "rail" | "tiroir";
}) {
  const pathname = usePathname();
  const tiroir = taille === "tiroir";

  return (
    <ul>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 transition-colors duration-500 ease-silk",
                tiroir ? "min-h-14 gap-4 py-2" : "py-3",
                active ? "text-ink" : "text-ink-soft hover:text-ink",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "origin-left bg-gold transition-all duration-700 ease-silk",
                  tiroir ? "h-0.5" : "h-px",
                  active ? (tiroir ? "w-7" : "w-5") : "w-0 group-hover:w-3",
                )}
              />
              <span
                className={cn(
                  tiroir
                    ? "font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.02em]"
                    : "eyebrow-sm",
                )}
              >
                {item.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserBlock({ user, compact }: { user: SessionUser; compact?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const initials =
    (user.firstName?.[0] ?? user.email[0] ?? "Z").toUpperCase() +
    (user.lastName?.[0]?.toUpperCase() ?? "");

  return (
    <div className={cn("border-t border-line pt-6", compact && "mt-8")}>
      <div className="flex items-center gap-3">
        <span className="arch grid size-9 shrink-0 place-items-center bg-champagne-soft font-display text-xs text-brown">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-light text-ink">
            {user.firstName ?? user.email.split("@")[0]}
          </p>
          <p className="truncate text-[0.6875rem] font-light text-ink-faint">{user.email}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await signOutAction();
          router.replace("/");
          router.refresh();
        }}
        className="eyebrow-sm link-draw inline-flex min-h-11 items-center mt-5 text-ink-faint transition-colors hover:text-danger disabled:opacity-50"
      >
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </div>
  );
}

export function DashboardShell({
  user,
  admin = false,
  children,
}: {
  user: SessionUser;
  admin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    /* L'espace prive est une surface de marque : il parle la voix
       cerise, comme la landing et la porte. Les ecrans du parcours
       anniversaire portent `voix-agrume` a l'interieur et reprennent
       la main sur leur sous-arbre. */
    <div className="voix-cerise fond-cerise min-h-dvh lg:flex">
      {/* ── Rail latéral ─────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-dvh w-[16rem] shrink-0 flex-col justify-between border-r border-line px-9 py-10 lg:flex">
        <div>
          <Logo />
          <nav aria-label="Navigation principale" className="mt-16">
            <p className="eyebrow-sm mb-3 text-ink-faint">Espace</p>
            <NavList items={PRIMARY} />
            <div className="my-7 h-px bg-line" />
            <NavList items={admin ? [...SECONDARY, ADMIN_LIEN] : SECONDARY} />
          </nav>
        </div>
        <UserBlock user={user} />
      </aside>

      {/* ── Barre mobile ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ivory/92 px-6 backdrop-blur-md lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="-mr-2 flex size-11 flex-col items-end justify-center gap-[5px] px-2"
        >
          <span className={cn("h-px bg-ink transition-all duration-500 ease-silk", open ? "w-5 translate-y-[3px] rotate-45" : "w-6")} />
          <span className={cn("h-px bg-ink transition-all duration-500 ease-silk", open ? "w-5 -translate-y-[3px] -rotate-45" : "w-4")} />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Navigation"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] overflow-y-auto bg-ivory px-6 py-10 lg:hidden"
          >
            <Icone className="mb-8 size-7" />
            <NavList items={PRIMARY} onNavigate={() => setOpen(false)} taille="tiroir" />
            <div className="my-7 h-px bg-line" />
            <NavList items={admin ? [...SECONDARY, ADMIN_LIEN] : SECONDARY} onNavigate={() => setOpen(false)} taille="tiroir" />
            <UserBlock user={user} compact />
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
