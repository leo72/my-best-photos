import { AccountSettingsCard } from '../components/settings/account-settings-card';
import { SessionSettingsCard } from '../components/settings/session-settings-card';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { RequireAuth } from '../features/auth/require-auth';

export function SettingsPage() {
  return (
    <RequireAuth>
      <SiteLayout>
        <div className="flex flex-1 flex-col bg-slate-50">
          <Container
            as="main"
            className="max-w-2xl py-10 sm:py-12"
          >
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Settings
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your account and session.
              </p>
            </header>

            <div className="mt-8 grid gap-4">
              <AccountSettingsCard />
              <SessionSettingsCard />
            </div>
          </Container>
        </div>
      </SiteLayout>
    </RequireAuth>
  );
}
