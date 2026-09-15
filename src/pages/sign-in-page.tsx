import { AuthPageLayout } from '../features/auth/auth-page-layout';
import { RequireGuest } from '../features/auth/require-guest';
import { SignInHeaderActions } from '../features/auth/auth-header-actions';
import { SignInForm } from '../features/auth/sign-in-form';

export function SignInPage() {
  return (
    <RequireGuest>
      <AuthPageLayout headerActions={<SignInHeaderActions />}>
        <SignInForm />
      </AuthPageLayout>
    </RequireGuest>
  );
}
