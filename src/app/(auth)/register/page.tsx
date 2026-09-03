import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/forms";
import { AuthFooterLink, AuthHeading } from "@/components/auth/parts";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Première étape"
        title={<>Votre invitation <span className="italic">commence ici.</span></>}
        description="Vous ne la publiez que le jour où elle vous ressemble."
      />
      <RegisterForm />
      <AuthFooterLink href="/login" label="Se connecter">
        Vous avez déjà un compte ?
      </AuthFooterLink>
    </>
  );
}
