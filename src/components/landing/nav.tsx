"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "#promesse", label: "La promesse" },
  { href: "#creation", label: "Comment ça marche" },
  { href: "#collections", label: "Collections" },
  { href: "#experience", label: "L’expérience" },
];

export function Nav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-silk",
        scrolled ? "bg-ivory/88 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left bg-line-strong transition-transform duration-700 ease-silk",
          scrolled ? "scale-x-100" : "scale-x-0",
        )}
      />
      <nav className="shell flex h-[4.5rem] items-center justify-between gap-8">
        <Logo suffix="Mariage" />

        <ul className="hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="eyebrow-sm link-draw text-ink-soft transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-7 md:flex">
          {signedIn ? (
            <ButtonLink href="/dashboard" variant="outline" size="sm">Mon espace</ButtonLink>
          ) : (
            <>
              <Link href="/login" className="eyebrow-sm link-draw text-ink-soft transition-colors hover:text-ink">
                Se connecter
              </Link>
              <ButtonLink href="/register" size="sm">Créer mon invitation</ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="-mr-2 flex size-11 flex-col items-end justify-center gap-[5px] px-2 md:hidden"
        >
          <span className={cn("h-px bg-ink transition-all duration-500 ease-silk", open ? "w-5 translate-y-[3px] rotate-45" : "w-6")} />
          <span className={cn("h-px bg-ink transition-all duration-500 ease-silk", open ? "w-5 -translate-y-[3px] -rotate-45" : "w-4")} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="shell h-[calc(100dvh-4.5rem)] overflow-hidden border-t border-line bg-ivory pt-12 md:hidden"
          >
            <ul className="space-y-7">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-1 font-display text-3xl text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-14 flex flex-col gap-4 border-t border-line pt-10">
              {signedIn ? (
                <ButtonLink href="/dashboard" size="lg" className="w-full">Mon espace</ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/register" size="lg" className="w-full">Créer mon invitation</ButtonLink>
                  <ButtonLink href="/login" variant="outline" size="lg" className="w-full">Se connecter</ButtonLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
