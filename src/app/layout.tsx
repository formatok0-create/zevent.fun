import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

/* L’adresse publique du site. Les liens de partage et les aperçus
   WhatsApp sont construits à partir d’elle. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zevent-fun.vercel.app";

const SITE_NAME = "Zevent";
const SITE_DESCRIPTION =
  "Créez une invitation de mariage digitale élégante, immersive et entièrement personnalisée. Une expérience, pas un simple faire-part.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — L’invitation de mariage, en plus beau`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "invitation mariage",
    "faire-part digital",
    "mariage Abidjan",
    "mariage musulman",
    "mariage chrétien",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — L’invitation de mariage, en plus beau`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  /* Pas de champ `icons` ici : Next lit `app/icon.png`,
     `app/apple-icon.png` et `app/favicon.ico` tout seul, et leur ajoute
     une empreinte de version. Le declarer a la main les ecraserait. */
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="paper grain relative min-h-dvh antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
