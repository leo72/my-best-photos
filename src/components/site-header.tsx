import type { ReactNode } from 'react';

import { Container } from './container';
import { Logo } from './logo';

interface SiteHeaderProps {
  children?: ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-100 bg-white">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />
        {children ? (
          <div className="flex min-w-0 items-center gap-5 sm:gap-6">
            {children}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
