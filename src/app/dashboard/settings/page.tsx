import type { Metadata } from "next";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import {
  AccountForms,
  DangerZone,
  PreferencesForm,
  ProfileForm,
  SecurityPanel,
  SettingsSection,
} from "@/components/dashboard/settings-forms";
import { requireUser } from "@/lib/services/session";
import { getProfile } from "@/lib/services/profiles";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Votre compte"
        title={<>Paramètres</>}
        description="Votre identité, votre accès, vos préférences. Rien de plus."
      />

      <div className="space-y-16">
        <SettingsSection
          title="Profil"
          description="Le prénom affiché dans votre espace et sur vos exports."
        >
          <ProfileForm user={user} profile={profile} />
        </SettingsSection>

        <SettingsSection
          title="Compte"
          description="Les identifiants qui vous permettent de vous connecter."
        >
          <AccountForms email={user.email} />
        </SettingsSection>

        <SettingsSection title="Préférences" description="Quelques réglages d’affichage.">
          <PreferencesForm locale={profile?.locale ?? "fr"} />
        </SettingsSection>

        <SettingsSection title="Sécurité" description="Votre session en cours sur cet appareil.">
          <SecurityPanel email={user.email} />
        </SettingsSection>

        <SettingsSection title="Zone dangereuse" danger>
          <DangerZone />
        </SettingsSection>
      </div>
    </PageFrame>
  );
}
