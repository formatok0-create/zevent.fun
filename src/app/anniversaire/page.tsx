import type { Metadata } from "next";
import { Nav } from "@/components/fete/nav";
import { Hero } from "@/components/fete/hero";
import { Promise as PromiseSection } from "@/components/fete/promise";
import { HowItWorks } from "@/components/fete/how-it-works";
import { Showcase } from "@/components/fete/showcase";
import { Experience } from "@/components/fete/experience";
import { MobileFirst } from "@/components/fete/mobile-first";
import { FinalCta } from "@/components/fete/final-cta";
import { Footer } from "@/components/fete/footer";
import { getSessionUser } from "@/lib/services/session";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: `Anniversaire — ${SITE.name}`,
  description:
    "Créez la page de votre anniversaire : l’âge, la date, le lieu, la playlist et vos photos. Un lien à partager, une soirée qu’on n’oublie pas.",
};

export default async function AnniversaireLandingPage() {
  const user = await getSessionUser();

  return (
    /* La voix agrume couvre la fête entière. Une classe, aucun
       composant modifié — et le mariage n'y touche pas. */
    <div className="voix-agrume fond-agrume">
      <Nav signedIn={Boolean(user)} />
      <main id="contenu">
        <Hero />
        <PromiseSection />
        <HowItWorks />
        <Showcase />
        <Experience />
        <MobileFirst />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
