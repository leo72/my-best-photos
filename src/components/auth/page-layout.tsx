import type { ReactNode } from 'react';

import { Container } from '../layout/container';
import { SiteLayout } from '../layout/site-layout';

interface AuthPageLayoutProps {
  headerActions: ReactNode;
  children: ReactNode;
}

/** Shared chrome for sign-in / create pages: header + centered card area. */
export function AuthPageLayout({
  headerActions,
  children,
}: AuthPageLayoutProps) {
  return (
    <SiteLayout headerActions={headerActions}>
      <div className="flex flex-1 flex-col bg-slate-50">
        <Container
          as="main"
          className="flex flex-1 justify-center py-10 sm:py-16"
        >
          <div className="w-full max-w-md">{children}</div>
        </Container>
      </div>
    </SiteLayout>
  );
}
