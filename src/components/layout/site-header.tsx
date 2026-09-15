import type { ReactNode } from 'react';

import { Container } from './container';
import { Logo } from './logo';

interface SiteHeaderProps {
  children?: ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="relative z-30 border-b border-slate-100 bg-white">
      <Container className="flex h-16 items-center justify-between gap-4 sm:gap-6">
        <Logo />
        {children ? (
          <div className="flex shrink-0 items-center">
            {children}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
