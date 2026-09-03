"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="shell grid min-h-dvh place-items-center py-24 text-center">
      <div className="max-w-md">
        <Logo />
        <p className="eyebrow mt-12 text-gold">Incident</p>
        <h1 className="mt-6 font-display text-[clamp(2.2rem,6vw,3.25rem)] leading-[1.05]">
          Quelque chose s’est interrompu.
        </h1>
        <p className="mt-6 text-sm font-light leading-relaxed text-ink-soft">
          Rien n’est perdu : vos invitations sont enregistrées. Réessayez, et si l’écran
          revient, revenez dans quelques minutes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Réessayer</Button>
          <ButtonLink href="/dashboard" variant="ghost">Retour à mon espace</ButtonLink>
        </div>
      </div>
    </main>
  );
}
