import type { ReactNode } from 'react';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { TopMenu } from './top-menu';

interface SiteLayoutProps {
  headerActions?: ReactNode;
  children: ReactNode;
}

export function SiteLayout({
  headerActions,
  children,
}: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <SiteHeader>{headerActions ?? <TopMenu />}</SiteHeader>
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
