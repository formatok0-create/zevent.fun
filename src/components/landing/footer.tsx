import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "#collections", label: "Collections" },
      { href: "#creation", label: "Comment ça marche" },
      { href: "#experience", label: "L’expérience" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/register", label: "Créer un compte" },
      { href: "/login", label: "Se connecter" },
      { href: "/dashboard", label: "Mon espace" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-ink-soft">
            L’invitation de mariage digitale, dessinée comme une papeterie de maison.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="eyebrow-sm text-ink-faint">{column.title}</p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="link-draw inline-flex min-h-11 items-center text-sm font-light text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col items-start justify-between gap-3 border-t border-line py-7 sm:flex-row sm:items-center">
        <p className="eyebrow-sm text-ink-faint">© {new Date().getFullYear()} Zevent</p>
        <p className="eyebrow-sm text-ink-faint">Fait avec soin — Abidjan</p>
      </div>
      {/* Les textes légaux sont accessibles depuis chaque page :
          les fournisseurs de paiement le vérifient, et un client
          doit pouvoir les retrouver après son achat. */}
      <nav aria-label="Informations légales" className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-6">
            {[
              { href: "/conditions-generales", label: "Conditions générales" },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/mentions-legales", label: "Mentions légales" },
            ].map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="link-draw inline-flex min-h-11 items-center text-xs font-light text-ink-faint transition-colors hover:text-ink-soft"
              >
                {doc.label}
              </Link>
            ))}

      </nav>
    </footer>
  );
}
