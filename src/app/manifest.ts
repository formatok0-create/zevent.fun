import type { MetadataRoute } from "next";

/* Le manifeste : ce que voit un téléphone quand on ajoute Zevent à
   l'écran d'accueil. L'icône « maskable » est la même, avec de la marge :
   Android rogne les bords et le Z se serait fait couper. */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zevent — Invitations digitales",
    short_name: "Zevent",
    description:
      "Créez l'invitation digitale de votre mariage ou de votre anniversaire. Un lien à partager, une émotion à transmettre.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    lang: "fr",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
