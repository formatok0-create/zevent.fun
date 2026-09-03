import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/forms";
import { AuthFooterLink, AuthHeading, DemoHint } from "@/components/auth/parts";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Se connecter" };

export default async function LoginPage() {
  const demo = !isSupabaseConfigured
    ? (await import("@/lib/demo/store")).DEMO_ACCOUNT
    : null;

  return (
    <>
      <AuthHeading
        eyebrow="Espace privé"
        title={<>Vos invitations <span className="italic">vous attendent.</span></>}
        description="Exactement là où vous les avez laissées."
      />
      {demo && <DemoHint email={demo.email} password={demo.password} />}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <AuthFooterLink href="/register" label="Créer un compte">
        Vous n’avez pas encore de compte ?
      </AuthFooterLink>
    </>
  );
}
