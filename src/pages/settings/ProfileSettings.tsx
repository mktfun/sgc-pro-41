
import { AppCard } from '@/components/ui/app-card';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { CommissionAutomationSettings } from '@/components/settings/CommissionAutomationSettings';

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <AppCard>
        <CardHeader>
          <CardTitle className="text-white">Meu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e configurações de conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </AppCard>

      <CommissionAutomationSettings />
    </div>
  );
}
