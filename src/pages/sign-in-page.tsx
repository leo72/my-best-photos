import { AuthPageLayout } from '../components/auth/page-layout';
import { SignInHeaderActions } from '../components/auth/header-actions';
import { SignInForm } from '../components/auth/sign-in-form';
import { RequireGuest } from '../features/auth/require-guest';

export function SignInPage() {
  return (
    <RequireGuest>
      <AuthPageLayout headerActions={<SignInHeaderActions />}>
        <SignInForm />
      </AuthPageLayout>
    </RequireGuest>
  );
}
