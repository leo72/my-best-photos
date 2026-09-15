import { AuthPageLayout } from '../components/auth/page-layout';
import { CreateHeaderActions } from '../components/auth/header-actions';
import { CreatePageForm } from '../components/auth/create-page-form';
import { RequireGuest } from '../features/auth/require-guest';

export function CreatePage() {
  return (
    <RequireGuest>
      <AuthPageLayout headerActions={<CreateHeaderActions />}>
        <CreatePageForm />
      </AuthPageLayout>
    </RequireGuest>
  );
}
