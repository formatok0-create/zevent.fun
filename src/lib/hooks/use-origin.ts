"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/config";

/**
 * L’origine réelle vue par le navigateur.
 *
 * Les liens publics doivent porter le domaine sur lequel le couple
 * se trouve, pas une constante de build : sinon un lien copié depuis
 * une preview envoie les invités sur un domaine mort.
 */
export function useOrigin(): string {
  const [origin, setOrigin] = useState(SITE.url);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  return origin;
}
