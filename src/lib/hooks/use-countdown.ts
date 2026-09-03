"use client";

import { useEffect, useState } from "react";
import { countdownParts } from "@/lib/utils/date";

/** Compte à rebours vivant, sans dépendance et sans re-render inutile. */
export function useCountdown(target: string | null | undefined) {
  /* Le serveur et le navigateur ne calculeraient pas la même
     seconde : on n’affiche rien avant le montage. */
  const [parts, setParts] = useState<ReturnType<typeof countdownParts>>(null);

  useEffect(() => {
    setParts(countdownParts(target));
    const id = window.setInterval(() => setParts(countdownParts(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}
