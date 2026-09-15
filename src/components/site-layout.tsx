import type { ReactNode } from 'react';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

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
      <SiteHeader>{headerActions}</SiteHeader>
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
