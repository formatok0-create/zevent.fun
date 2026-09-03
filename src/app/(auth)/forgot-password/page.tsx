import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forms";
import { AuthFooterLink, AuthHeading } from "@/components/auth/parts";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Récupération"
        title={<>Un mot de passe, <span className="italic">ça s’oublie.</span></>}
        description="Votre adresse, et nous envoyons un lien pour en choisir un autre."
      />
      <ForgotPasswordForm />
      <AuthFooterLink href="/login" label="Revenir à la connexion">
        Vous vous en souvenez finalement ?
      </AuthFooterLink>
    </>
  );
}
