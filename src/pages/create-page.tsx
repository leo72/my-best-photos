import { AuthPageLayout } from '../features/auth/auth-page-layout';
import { RequireGuest } from '../features/auth/require-guest';
import { CreateHeaderActions } from '../features/auth/auth-header-actions';
import { CreatePageForm } from '../features/auth/create-page-form';

export function CreatePage() {
  return (
    <RequireGuest>
      <AuthPageLayout headerActions={<CreateHeaderActions />}>
        <CreatePageForm />
      </AuthPageLayout>
    </RequireGuest>
  );
}
