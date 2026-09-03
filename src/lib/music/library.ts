/* ═══════════════════════════════════════════════════════════════
   LA BIBLIOTHÈQUE MUSICALE
   Les morceaux proposés aux couples. Pour en ajouter un :
   déposez le fichier dans public/music/ et ajoutez une entrée ici.
   Aucun autre fichier de l’application n’est à modifier.
   ═══════════════════════════════════════════════════════════════ */

import type { WeddingType } from "@/types/database";

export interface Track {
  id: string;
  title: string;
  artist?: string;
  /** Chemin public, ou URL complète si le fichier est hébergé ailleurs. */
  url: string;
  /** Types de cérémonie auxquels le morceau convient. */
  weddingTypes: WeddingType[];
}

export const MUSIC_LIBRARY: Track[] = [
  {
    id: "mawla-ya-salli-wasallim",
    title: "Mawla Ya Salli Wasallim",
    artist: "Nasheed traditionnel",
    url: "/music/mawla-ya-salli-wasallim.mp3",
    weddingTypes: ["musulman"],
  },
  {
    id: "ordinary",
    title: "Ordinary",
    artist: "Alex Warren",
    url: "/music/ordinary.mp3",
    weddingTypes: ["chretien"],
  },
];

export function tracksFor(weddingType: WeddingType): Track[] {
  return MUSIC_LIBRARY.filter((track) => track.weddingTypes.includes(weddingType));
}

export function findTrack(url: string | null | undefined): Track | null {
  if (!url) return null;
  return MUSIC_LIBRARY.find((track) => track.url === url) ?? null;
}
