import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/forms";
import { AuthHeading } from "@/components/auth/parts";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Dernière étape"
        title={<>Un nouveau <span className="italic">mot de passe.</span></>}
        description="Il remplace l’ancien sur tous vos appareils, immédiatement."
      />
      <ResetPasswordForm />
    </>
  );
}
