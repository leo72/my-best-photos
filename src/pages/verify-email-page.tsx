import { AuthPageLayout } from '../components/auth/page-layout';
import { VerifyEmailCard } from '../components/auth/verify-email-card';
import { TopMenu } from '../components/layout/top-menu';
import { RequireUnverifiedEmail } from '../features/auth/require-unverified-email';

export function VerifyEmailPage() {
  return (
    <RequireUnverifiedEmail>
      <AuthPageLayout headerActions={<TopMenu />}>
        <VerifyEmailCard />
      </AuthPageLayout>
    </RequireUnverifiedEmail>
  );
}
