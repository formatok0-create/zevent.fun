import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Promise as PromiseSection } from "@/components/landing/promise";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Showcase } from "@/components/landing/showcase";
import { Experience } from "@/components/landing/experience";
import { MobileFirst } from "@/components/landing/mobile-first";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { getSessionUser } from "@/lib/services/session";

export default async function MariageLandingPage() {
  const user = await getSessionUser();

  return (
    /* La voix cerise couvre la landing entière : nav, hero, sections,
       pied de page. Une classe, aucun composant modifié. */
    <div className="voix-cerise fond-cerise">
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
